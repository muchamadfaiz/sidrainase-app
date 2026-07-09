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
  polygon_coords: any;
  polyline_coords: any;
}

const MAX_LIMIT = 5000;

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
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const limit = Math.min(query.limit ?? 3000, MAX_LIMIT);

    return this.prisma.$queryRaw<DrainageMapPoint[]>`
      SELECT
        id, drainage_id, name, lat, lng,
        drainage_type::text AS drainage_type,
        condition::text AS condition,
        district, length,
        ST_AsGeoJSON(polygon_coords)::json AS polygon_coords,
        ST_AsGeoJSON(polyline_coords)::json AS polyline_coords
      FROM drainage_points
      ${whereClause}
      LIMIT ${limit}
    `;
  }
}
