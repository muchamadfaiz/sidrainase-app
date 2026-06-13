import { DrainagePointResponseDto } from '../dto';

/**
 * Row shape returned by raw SQL SELECT (in find-all & find-by-id use-cases).
 * polygon_coords / polyline_coords come from `ST_AsGeoJSON(...)::json` so they
 * arrive as parsed GeoJSON objects (or null).
 */
export interface DrainagePointRawRow {
  id: string;
  drainage_id: string;
  name: string;
  lat: number;
  lng: number;
  drainage_type: string;
  condition: string;
  infrastructure_type: string | null;
  length: number;
  width: number;
  depth: number;
  last_inspection: Date;
  district: string;
  description: string | null;
  polygon_coords: any; // already parsed from ::json
  polyline_coords: any;
  created_at: Date;
  updated_at: Date;
}

export class DrainagePointMapper {
  static toResponseDto(row: DrainagePointRawRow): DrainagePointResponseDto {
    return {
      id: row.id,
      drainage_id: row.drainage_id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      drainage_type: row.drainage_type as any,
      condition: row.condition as any,
      infrastructure_type: row.infrastructure_type ?? undefined,
      length: Number(row.length),
      width: Number(row.width),
      depth: Number(row.depth),
      last_inspection:
        row.last_inspection instanceof Date
          ? row.last_inspection.toISOString().split('T')[0]
          : String(row.last_inspection).split('T')[0],
      district: row.district,
      description: row.description ?? undefined,
      polygon_coords: row.polygon_coords ?? null,
      polyline_coords: row.polyline_coords ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  static toResponseDtoList(rows: DrainagePointRawRow[]): DrainagePointResponseDto[] {
    return rows.map((r) => DrainagePointMapper.toResponseDto(r));
  }
}
