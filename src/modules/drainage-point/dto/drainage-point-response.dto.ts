import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrainageType, DrainageCondition } from '@prisma/client';
import type { GeoJSONLineString, GeoJSONPolygon } from '../../../common';

export class DrainagePointResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'D001' })
  drainage_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiProperty({ enum: DrainageType })
  drainage_type: DrainageType;

  @ApiProperty({ enum: DrainageCondition })
  condition: DrainageCondition;

  @ApiProperty({ description: 'meter' })
  length: number;

  @ApiProperty({ description: 'meter' })
  width: number;

  @ApiProperty({ description: 'meter' })
  depth: number;

  @ApiProperty({ description: 'ISO date' })
  last_inspection: string;

  @ApiProperty()
  district: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'GeoJSON Polygon' })
  polygon_coords?: GeoJSONPolygon | null;

  @ApiPropertyOptional({ description: 'GeoJSON LineString' })
  polyline_coords?: GeoJSONLineString | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
