import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveDrainagePointUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.drainagePoint.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Drainage point not found');
    }
    await this.prisma.drainagePoint.delete({ where: { id } });
  }
}
