/**
 * Isi kolom `district` tiap drainase dari koordinatnya (point-in-polygon)
 * pakai batas kecamatan Palembang (prisma/palembang_kec.geojson, sumber GADM v4.1).
 *
 * Cara pakai (lokal/host):   npx tsx prisma/assign-districts.ts
 * Di server (dalam container): docker compose exec app npx tsx prisma/assign-districts.ts
 *
 * Default: cuma mengisi yg district-nya masih '-' / kosong (data manual tidak diubah).
 * Set OVERWRITE=1 untuk menimpa semua.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const GEOJSON = path.resolve(process.cwd(), 'prisma/palembang_kec.geojson');
const OVERWRITE = process.env.OVERWRITE === '1';

async function main() {
  const fc = JSON.parse(fs.readFileSync(GEOJSON, 'utf8'));
  const feats: any[] = fc.features ?? [];
  console.log(`Kecamatan: ${feats.length}. Mode: ${OVERWRITE ? 'timpa semua' : "isi yg '-'"}`);

  // Filter: kalau bukan overwrite, cuma baris yg district-nya kosong/'-'
  const onlyUnset = OVERWRITE
    ? Prisma.empty
    : Prisma.sql`AND (district = '-' OR district = '' OR district IS NULL)`;

  let totalMatched = 0;
  for (const f of feats) {
    const name: string = f.properties?.name;
    const geojson = JSON.stringify(f.geometry);
    // Titik (lng,lat) di dalam poligon kecamatan -> set district
    const n = await prisma.$executeRaw`
      UPDATE drainage_points
      SET district = ${name}, updated_at = NOW()
      WHERE ST_Contains(
              ST_SetSRID(ST_GeomFromGeoJSON(${geojson}), 4326),
              ST_SetSRID(ST_MakePoint(lng, lat), 4326)
            )
      ${onlyUnset}
    `;
    console.log(`  ${name}: ${n} titik`);
    totalMatched += n;
  }

  const sisa = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM drainage_points
    WHERE district = '-' OR district = '' OR district IS NULL
  `;
  console.log(`Selesai. Total ter-assign: ${totalMatched}. Masih tanpa wilayah: ${Number(sisa[0].count)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
