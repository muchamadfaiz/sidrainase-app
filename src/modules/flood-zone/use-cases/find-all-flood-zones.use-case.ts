import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FloodZoneResponseDto } from '../dto';
import { FloodZoneMapper } from '../mapper/flood-zone.mapper';

@Injectable()
export class FindAllFloodZonesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<FloodZoneResponseDto[]> {
    const zones = await this.prisma.floodZone.findMany({
      orderBy: { created_at: 'desc' },
    });
    return FloodZoneMapper.toResponseDtoList(zones);
  }
}
