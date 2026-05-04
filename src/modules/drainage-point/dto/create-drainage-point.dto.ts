import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrainageType, DrainageCondition } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { GeoJSONLineString, GeoJSONPolygon } from '../../../common';

export class CreateDrainagePointDto {
  @ApiPropertyOptional({
    description: 'Human-readable code (e.g. "D013"). Auto-generated if empty.',
    example: 'D013',
  })
  @IsString()
  @IsOptional()
  drainage_id?: string;

  @ApiProperty({ example: 'Drainase Jl. Sudirman Utara' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: -6.2088 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.8456 })
  @IsNumber()
  lng: number;

  @ApiProperty({ enum: DrainageType, example: DrainageType.primer })
  @IsEnum(DrainageType)
  drainage_type: DrainageType;

  @ApiProperty({ enum: DrainageCondition, example: DrainageCondition.baik })
  @IsEnum(DrainageCondition)
  condition: DrainageCondition;

  @ApiProperty({ example: 1200, description: 'Length in meters' })
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty({ example: 3.5, description: 'Width in meters' })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ example: 2.0, description: 'Depth in meters' })
  @IsNumber()
  @Min(0)
  depth: number;

  @ApiProperty({ example: '2026-02-15', description: 'ISO date' })
  @IsDateString()
  last_inspection: string;

  @ApiProperty({ example: 'Jakarta Pusat' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 'Saluran drainase primer Jl. Sudirman bagian utara' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'GeoJSON Polygon. coordinates: [[[lng, lat], ...closing ring]]',
    example: {
      type: 'Polygon',
      coordinates: [[[106.84, -6.21], [106.85, -6.21], [106.85, -6.20], [106.84, -6.21]]],
    },
  })
  @IsObject()
  @IsOptional()
  polygon_coords?: GeoJSONPolygon;

  @ApiPropertyOptional({
    description: 'GeoJSON LineString. coordinates: [[lng, lat], ...]',
    example: {
      type: 'LineString',
      coordinates: [[106.84, -6.21], [106.85, -6.20]],
    },
  })
  @IsObject()
  @IsOptional()
  polyline_coords?: GeoJSONLineString;
}
