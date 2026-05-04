import { ApiProperty } from '@nestjs/swagger';
import { DrainageType, DrainageCondition } from '@prisma/client';
import type { GeoJSONLineString } from '../../../common';

export class DrainageSegmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'GeoJSON LineString' })
  points: GeoJSONLineString;

  @ApiProperty({ enum: DrainageType })
  drainage_type: DrainageType;

  @ApiProperty({ enum: DrainageCondition })
  condition: DrainageCondition;

  @ApiProperty({ description: 'meter' })
  length: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
