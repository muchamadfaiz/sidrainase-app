import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFloodZoneDto, FloodZoneResponseDto } from '../dto';
import { FloodZoneMapper } from '../mapper/flood-zone.mapper';

@Injectable()
export class CreateFloodZoneUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateFloodZoneDto): Promise<FloodZoneResponseDto> {
    const zone = await this.prisma.floodZone.create({ data: { ...dto } });
    return FloodZoneMapper.toResponseDto(zone);
  }
}
