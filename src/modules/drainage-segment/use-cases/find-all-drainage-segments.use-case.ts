import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainageSegmentResponseDto } from '../dto';
import {
  DrainageSegmentMapper,
  DrainageSegmentRawRow,
} from '../mapper/drainage-segment.mapper';

@Injectable()
export class FindAllDrainageSegmentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DrainageSegmentResponseDto[]> {
    const rows = await this.prisma.$queryRaw<DrainageSegmentRawRow[]>`
      SELECT
        id, name,
        ST_AsGeoJSON(points)::json AS points,
        drainage_type::text AS drainage_type,
        condition::text AS condition,
        length, created_at, updated_at
      FROM drainage_segments
      ORDER BY created_at DESC
    `;
    return DrainageSegmentMapper.toResponseDtoList(rows);
  }
}
