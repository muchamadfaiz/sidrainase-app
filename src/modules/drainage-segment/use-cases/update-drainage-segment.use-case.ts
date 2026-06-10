import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { validateLineString } from '../../../common/utils/postgis.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainageSegmentResponseDto, UpdateDrainageSegmentDto } from '../dto';
import { FindDrainageSegmentByIdUseCase } from './find-drainage-segment-by-id.use-case';

@Injectable()
export class UpdateDrainageSegmentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findById: FindDrainageSegmentByIdUseCase,
  ) {}

  async execute(input: {
    id: string;
    dto: UpdateDrainageSegmentDto;
  }): Promise<DrainageSegmentResponseDto> {
    const { id, dto } = input;

    const existing = await this.prisma.drainageSegment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Drainage segment not found');
    }

    if (dto.points !== undefined) {
      const err = validateLineString(dto.points);
      if (err) throw new BadRequestException(`points: ${err}`);
    }

    const updates: Prisma.Sql[] = [];
    if (dto.name !== undefined) updates.push(Prisma.sql`name = ${dto.name}`);
    if (dto.points !== undefined)
      updates.push(
        Prisma.sql`points = ST_GeomFromGeoJSON(${JSON.stringify(dto.points)})`,
      );
    if (dto.drainage_type !== undefined)
      updates.push(
        Prisma.sql`drainage_type = ${dto.drainage_type}::"DrainageType"`,
      );
    if (dto.condition !== undefined)
      updates.push(Prisma.sql`condition = ${dto.condition}::"DrainageCondition"`);
    if (dto.length !== undefined)
      updates.push(Prisma.sql`length = ${dto.length}`);

    if (updates.length === 0) {
      return this.findById.execute(id);
    }

    updates.push(Prisma.sql`updated_at = NOW()`);

    await this.prisma.$executeRaw`
      UPDATE drainage_segments
      SET ${Prisma.join(updates, ', ')}
      WHERE id = ${id}
    `;

    return this.findById.execute(id);
  }
}
