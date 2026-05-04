import { DrainageSegmentResponseDto } from '../dto';

export interface DrainageSegmentRawRow {
  id: string;
  name: string;
  points: any; // already-parsed GeoJSON from ST_AsGeoJSON(...)::json
  drainage_type: string;
  condition: string;
  length: number;
  created_at: Date;
  updated_at: Date;
}

export class DrainageSegmentMapper {
  static toResponseDto(row: DrainageSegmentRawRow): DrainageSegmentResponseDto {
    return {
      id: row.id,
      name: row.name,
      points: row.points,
      drainage_type: row.drainage_type as any,
      condition: row.condition as any,
      length: Number(row.length),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  static toResponseDtoList(rows: DrainageSegmentRawRow[]): DrainageSegmentResponseDto[] {
    return rows.map((r) => DrainageSegmentMapper.toResponseDto(r));
  }
}
