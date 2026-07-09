import { ApiProperty } from '@nestjs/swagger';

export class DistrictStatDto {
  @ApiProperty({ example: 'Jakarta Pusat' })
  district: string;

  @ApiProperty({ example: 7 })
  count: number;

  @ApiProperty({ example: 8200, description: 'meter' })
  total_length: number;
}

export class DistrictConditionStatDto {
  @ApiProperty({ example: 'Jakarta Pusat' })
  district: string;

  @ApiProperty({ example: 'lainnya' })
  condition: string;

  @ApiProperty({ example: 5 })
  count: number;
}

export class DrainageStatsResponseDto {
  @ApiProperty({ example: 21 })
  total_points: number;

  @ApiProperty({ example: 24500, description: 'meter' })
  total_length_meters: number;

  @ApiProperty({
    description: 'Counts grouped by condition',
    example: { baik: 12, perlu_perbaikan: 6, rusak: 3 },
  })
  by_condition: Record<string, number>;

  @ApiProperty({
    description: 'Counts grouped by drainage type',
    example: { primer: 8, sekunder: 9, tersier: 4 },
  })
  by_type: Record<string, number>;

  @ApiProperty({ type: [DistrictStatDto] })
  by_district: DistrictStatDto[];

  @ApiProperty({ type: [DistrictConditionStatDto] })
  by_district_condition: DistrictConditionStatDto[];
}
