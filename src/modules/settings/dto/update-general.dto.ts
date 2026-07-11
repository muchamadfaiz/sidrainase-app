import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const BASEMAPS = ['osm', 'satellite'] as const;

/** Setelan umum peta. basemap default saat peta dibuka. */
export class UpdateGeneralDto {
  @ApiPropertyOptional({ enum: BASEMAPS, example: 'osm' })
  @IsOptional()
  @IsIn(BASEMAPS as unknown as string[])
  basemap?: string;
}
