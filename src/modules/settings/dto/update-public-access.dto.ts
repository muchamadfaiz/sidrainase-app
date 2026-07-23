import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Kode akses link input publik (/input).
 * Siapa pun yang punya kode ini bisa menambah & mengedit data drainase,
 * jadi kalau bocor tinggal diganti — link lama otomatis tidak berlaku.
 */
export class UpdatePublicAccessDto {
  @ApiPropertyOptional({ description: 'Kode akses (min 6 karakter)' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Kode akses minimal 6 karakter' })
  code?: string;

  @ApiPropertyOptional({ description: 'Aktifkan/matikan link publik' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
