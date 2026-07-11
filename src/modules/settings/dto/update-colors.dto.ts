import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

/** Warna map<key, hex>. mis. { belum_ada_saluran: "#EF4444" } */
export class UpdateColorsDto {
  @ApiPropertyOptional({ description: 'Warna per kondisi (key -> hex)' })
  @IsOptional()
  @IsObject()
  condition?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Warna per tipe saluran (key -> hex)' })
  @IsOptional()
  @IsObject()
  type?: Record<string, string>;
}
