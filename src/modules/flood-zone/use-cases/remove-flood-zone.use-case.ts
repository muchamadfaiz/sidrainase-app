import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveFloodZoneUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.floodZone.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Flood zone not found');
    }
    await this.prisma.floodZone.delete({ where: { id } });
  }
}
