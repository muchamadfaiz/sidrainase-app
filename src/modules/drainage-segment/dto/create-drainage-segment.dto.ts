import { ApiProperty } from '@nestjs/swagger';
import { DrainageType, DrainageCondition } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Min,
} from 'class-validator';
import type { GeoJSONLineString } from '../../../common';

export class CreateDrainageSegmentDto {
  @ApiProperty({ example: 'Jaringan Jl. Sudirman' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'GeoJSON LineString. coordinates: [[lng, lat], ...]',
    example: {
      type: 'LineString',
      coordinates: [
        [106.84, -6.21],
        [106.85, -6.2],
      ],
    },
  })
  @IsObject()
  points: GeoJSONLineString;

  @ApiProperty({ enum: DrainageType, example: DrainageType.primer })
  @IsEnum(DrainageType)
  drainage_type: DrainageType;

  @ApiProperty({ enum: DrainageCondition, example: DrainageCondition.baik })
  @IsEnum(DrainageCondition)
  condition: DrainageCondition;

  @ApiProperty({ example: 1500, description: 'Length in meters' })
  @IsNumber()
  @Min(0)
  length: number;
}
