import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainageMapQueryDto } from '../dto';

/** Titik ringkas buat peta (tanpa field yg nggak dipakai render). */
export interface DrainageMapPoint {
  id: string;
  drainage_id: string;
  name: string;
  lat: number;
  lng: number;
  drainage_type: string;
  condition: string;
  district: string;
  length: number;
  width: number;
  depth: number;
  job_number: string | null;
  last_inspection: Date;
  polygon_coords: any;
  polyline_coords: any;
}

// Cukup buat kirim SEMUA data (17rb) — payload dijaga kecil lewat simplify+presisi,
// bukan lewat memotong jumlah data.
const MAX_LIMIT = 50000;

// Lebar peta rata-rata (px). Dipakai nurunin toleransi simplify ~1 piksel:
// vertex yg jaraknya di bawah 1 piksel di layar percuma dikirim.
const ASSUMED_MAP_WIDTH_PX = 1200;

/** Presisi koordinat GeoJSON (6 desimal ≈ 0.1 m — jauh lebih dari cukup). */
const COORD_DECIMALS = 6;

@Injectable()
export class FindMapDrainagePointsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: DrainageMapQueryDto): Promise<DrainageMapPoint[]> {
    const conditions: Prisma.Sql[] = [];
    // Filter bbox pakai centroid lat/lng (cukup, tanpa PostGIS envelope)
    if (query.minLat != null && query.maxLat != null) {
      conditions.push(Prisma.sql`lat BETWEEN ${query.minLat} AND ${query.maxLat}`);
    }
    if (query.minLng != null && query.maxLng != null) {
      conditions.push(Prisma.sql`lng BETWEEN ${query.minLng} AND ${query.maxLng}`);
    }
    // Filter sama persis dgn tabel, biar peta bisa disaring juga
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        Prisma.sql`(name ILIKE ${pattern} OR drainage_id ILIKE ${pattern} OR district ILIKE ${pattern})`,
      );
    }
    if (query.condition) {
      conditions.push(Prisma.sql`condition = ${query.condition}`);
    }
    if (query.drainage_type) {
      conditions.push(
        Prisma.sql`drainage_type = ${query.drainage_type}::"DrainageType"`,
      );
    }
    if (query.district) {
      conditions.push(Prisma.sql`district = ${query.district}`);
    }
    if (query.infrastructure_type) {
      conditions.push(
        Prisma.sql`infrastructure_type = ${query.infrastructure_type}`,
      );
    }
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const limit = Math.min(query.limit ?? 3000, MAX_LIMIT);

    // Toleransi simplify = ~1 piksel pada zoom saat ini (derajat).
    // Zoom jauh -> bbox lebar -> toleransi besar -> vertex dipangkas banyak.
    // Zoom dekat -> bbox sempit -> toleransi kecil -> nyaris presisi penuh.
    const spanLng =
      query.minLng != null && query.maxLng != null
        ? Math.abs(query.maxLng - query.minLng)
        : 0;
    const tolerance = spanLng > 0 ? spanLng / ASSUMED_MAP_WIDTH_PX : 0;

    // Kalau tanpa bbox (tolerance 0), pakai geometri apa adanya.
    const simplify = (col: string) =>
      tolerance > 0
        ? Prisma.sql`ST_AsGeoJSON(ST_SimplifyPreserveTopology(${Prisma.raw(col)}, ${tolerance}), ${COORD_DECIMALS})::json`
        : Prisma.sql`ST_AsGeoJSON(${Prisma.raw(col)}, ${COORD_DECIMALS})::json`;

    return this.prisma.$queryRaw<DrainageMapPoint[]>`
      SELECT
        id, drainage_id, name, lat, lng,
        drainage_type::text AS drainage_type,
        condition::text AS condition,
        district, length, width, depth, job_number, last_inspection,
        ${simplify('polygon_coords')} AS polygon_coords,
        ${simplify('polyline_coords')} AS polyline_coords
      FROM drainage_points
      ${whereClause}
      ORDER BY length DESC NULLS LAST, drainage_id
      LIMIT ${limit}
    `;
  }
}
