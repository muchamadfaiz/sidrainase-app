import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveDrainageSegmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.drainageSegment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Drainage segment not found');
    }
    await this.prisma.drainageSegment.delete({ where: { id } });
  }
}
