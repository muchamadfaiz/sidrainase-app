import { ApiPropertyOptional } from '@nestjs/swagger';
import { DrainageType, DrainageCondition } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common';

export class DrainagePointQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search di name, drainage_id, district' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: DrainageCondition })
  @IsEnum(DrainageCondition)
  @IsOptional()
  condition?: DrainageCondition;

  @ApiPropertyOptional({ enum: DrainageType })
  @IsEnum(DrainageType)
  @IsOptional()
  drainage_type?: DrainageType;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsString()
  @IsOptional()
  district?: string;
}
