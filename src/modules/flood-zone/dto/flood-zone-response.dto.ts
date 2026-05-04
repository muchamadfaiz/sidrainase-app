import { ApiProperty } from '@nestjs/swagger';
import { FloodSeverity } from '@prisma/client';

export class FloodZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  center_lat: number;

  @ApiProperty()
  center_lng: number;

  @ApiProperty({ description: 'meter' })
  radius: number;

  @ApiProperty({ enum: FloodSeverity })
  severity: FloodSeverity;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
