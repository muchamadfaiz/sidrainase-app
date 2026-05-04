import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FloodZoneResponseDto } from '../dto';
import { FloodZoneMapper } from '../mapper/flood-zone.mapper';

@Injectable()
export class FindFloodZoneByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<FloodZoneResponseDto> {
    const zone = await this.prisma.floodZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Flood zone not found');
    }
    return FloodZoneMapper.toResponseDto(zone);
  }
}
