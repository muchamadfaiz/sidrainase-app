import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

/**
 * Query buat endpoint peta: ambil titik dalam viewport (bbox lat/lng) + cap jumlah.
 * Semua opsional; tanpa bbox = ambil sampai `limit` titik pertama.
 */
export class DrainageMapQueryDto {
  @ApiPropertyOptional({ example: 104.5 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minLng?: number;

  @ApiPropertyOptional({ example: -3.1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minLat?: number;

  @ApiPropertyOptional({ example: 105.0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxLng?: number;

  @ApiPropertyOptional({ example: -2.9 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxLat?: number;

  @ApiPropertyOptional({ default: 3000, description: 'Batas maksimum titik (anti-freeze)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;
}
