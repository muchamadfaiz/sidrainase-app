import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainageSegmentResponseDto } from '../dto';
import {
  DrainageSegmentMapper,
  DrainageSegmentRawRow,
} from '../mapper/drainage-segment.mapper';

@Injectable()
export class FindDrainageSegmentByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<DrainageSegmentResponseDto> {
    const rows = await this.prisma.$queryRaw<DrainageSegmentRawRow[]>`
      SELECT
        id, name,
        ST_AsGeoJSON(points)::json AS points,
        drainage_type::text AS drainage_type,
        condition::text AS condition,
        length, created_at, updated_at
      FROM drainage_segments
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      throw new NotFoundException('Drainage segment not found');
    }

    return DrainageSegmentMapper.toResponseDto(rows[0]);
  }
}
