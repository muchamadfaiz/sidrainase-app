import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FloodZoneResponseDto, UpdateFloodZoneDto } from '../dto';
import { FloodZoneMapper } from '../mapper/flood-zone.mapper';

@Injectable()
export class UpdateFloodZoneUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: {
    id: string;
    dto: UpdateFloodZoneDto;
  }): Promise<FloodZoneResponseDto> {
    const { id, dto } = input;

    const existing = await this.prisma.floodZone.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Flood zone not found');
    }

    const zone = await this.prisma.floodZone.update({
      where: { id },
      data: { ...dto },
    });
    return FloodZoneMapper.toResponseDto(zone);
  }
}
