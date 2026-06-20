import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrainageType } from '@prisma/client';
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

  @ApiProperty()
  condition: string;

  @ApiPropertyOptional({ description: 'Jenis aset infrastruktur' })
  infrastructure_type?: string | null;

  @ApiPropertyOptional({ description: 'Jenis kegiatan (rekonstruksi/pembuatan)' })
  activity_type?: string | null;

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

  @ApiPropertyOptional({ description: 'Foto kondisi', type: [Object] })
  photos?: { id: string; url: string }[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
