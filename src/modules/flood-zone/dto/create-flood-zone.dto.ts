import { ApiProperty } from '@nestjs/swagger';
import { FloodSeverity } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateFloodZoneDto {
  @ApiProperty({ example: 'Genangan Jl. Sudirman' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: -6.2088 })
  @IsNumber()
  center_lat: number;

  @ApiProperty({ example: 106.8456 })
  @IsNumber()
  center_lng: number;

  @ApiProperty({ example: 300, description: 'Radius in meters' })
  @IsInt()
  @Min(0)
  radius: number;

  @ApiProperty({ enum: FloodSeverity, example: FloodSeverity.sedang })
  @IsEnum(FloodSeverity)
  severity: FloodSeverity;
}
