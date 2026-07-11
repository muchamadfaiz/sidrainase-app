/**
 * Import data drainase dari KML (hasil ekstrak KMZ ArcGIS).
 * Cara pakai:
 *   1) Ekstrak KMZ -> dapat doc.kml
 *   2) IMPORT_LIMIT=100 npx tsx prisma/import-kmz.ts "path/ke/doc.kml"   (tes)
 *      npx tsx prisma/import-kmz.ts "path/ke/doc.kml"                    (semua)
 *
 * Field wajib yg tidak ada di sumber -> default:
 *   condition="lainnya", district="-", drainage_type=primer/tersier, depth=0, last_inspection=hari ini
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KML_PATH = process.argv[2] || 'doc.kml';
const LIMIT = process.env.IMPORT_LIMIT
  ? parseInt(process.env.IMPORT_LIMIT, 10)
  : Infinity;
const DRY = process.env.DRY_RUN === '1'; // parse & print saja, tanpa DB

/** Ambil nilai atribut dari tabel HTML: <td>KEY</td> <td>VALUE</td> */
function attr(block: string, key: string): string {
  const m = block.match(new RegExp(`<td>${key}</td>\\s*<td>([\\s\\S]*?)</td>`, 'i'));
  return m ? m[1].trim() : '';
}

/** Angka format Indonesia: "1.234,5" -> 1234.5 ; "84,68" -> 84.68 */
function num(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Panjang garis (meter) via haversine. Dipakai kalau PANJANG_M di KMZ = 0
 * (10rb+ baris begitu). Cocok ~0.05m dgn PostGIS ST_Length(geography).
 * ponytail: haversine cukup di skala kota; ganti ke PostGIS kalau butuh presisi.
 */
function geoLength(coords: [number, number][]): number {
  const R = 6371000;
  let sum = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    sum += 2 * R * Math.asin(Math.sqrt(a));
  }
  return Math.round(sum * 100) / 100;
}

async function main() {
  console.log(`Baca ${KML_PATH} ...`);
  const kml = fs.readFileSync(KML_PATH, 'utf8');
  const placemarks = kml.match(/<Placemark[\s\S]*?<\/Placemark>/g) || [];
  console.log(`Ditemukan ${placemarks.length} placemark. Limit=${LIMIT}`);

  let ok = 0;
  let skip = 0;
  let i = 0;

  for (const pm of placemarks) {
    if (i >= LIMIT) break;

    const cm = pm.match(/<LineString>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!cm) {
      skip++;
      continue;
    }
    const coords = cm[1]
      .trim()
      .split(/\s+/)
      .map((t) => {
        const [lng, lat] = t.split(',').map(Number);
        return [lng, lat] as [number, number];
      })
      .filter((c) => c.length === 2 && !Number.isNaN(c[0]) && !Number.isNaN(c[1]));
    if (coords.length < 2) {
      skip++;
      continue;
    }

    const nmSungai = attr(pm, 'NM_SUNGAI');
    const ket = attr(pm, 'KETERANGAN');
    // PANJANG_M di sumber TIDAK ANDAL (sebagian 0, sebagian satuan km, sebagian m).
    // Pakai panjang dari geometri sebagai sumber kebenaran.
    const panjang = geoLength(coords);
    const lebar = num(attr(pm, 'LEBAR_M'));

    const name = nmSungai || ket || `Saluran ${i + 1}`;
    const type = nmSungai || /sungai/i.test(ket) ? 'primer' : 'tersier';
    const mid = coords[Math.floor(coords.length / 2)];
    const geojson = JSON.stringify({ type: 'LineString', coordinates: coords });
    const drainageId = `IMP-${String(i + 1).padStart(6, '0')}`;

    if (DRY) {
      if (i < 3) {
        console.log(
          `[${drainageId}] name="${name}" type=${type} panjang=${panjang} lebar=${lebar} titik=${coords.length} desc="${ket}"`,
        );
      }
    } else {
      await prisma.$executeRaw`
        INSERT INTO drainage_points (
          id, drainage_id, name, lat, lng, drainage_type, condition,
          length, width, depth, last_inspection, district, description,
          polyline_coords, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${drainageId}, ${name}, ${mid[1]}, ${mid[0]},
          ${type}::"DrainageType", ${'lainnya'},
          ${panjang}, ${lebar}, ${0}, NOW()::date, ${'-'}, ${ket || null},
          ST_GeomFromGeoJSON(${geojson}), NOW(), NOW()
        )
        ON CONFLICT (drainage_id) DO NOTHING
      `;
      if (ok % 500 === 0) console.log(`  ...${ok} masuk`);
    }
    ok++;
    i++;
  }

  console.log(`Selesai. Masuk: ${ok}, dilewati: ${skip}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
