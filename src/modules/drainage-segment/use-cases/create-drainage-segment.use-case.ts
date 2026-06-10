import { BadRequestException, Injectable } from '@nestjs/common';
import { validateLineString } from '../../../common/utils/postgis.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDrainageSegmentDto, DrainageSegmentResponseDto } from '../dto';
import { FindDrainageSegmentByIdUseCase } from './find-drainage-segment-by-id.use-case';

@Injectable()
export class CreateDrainageSegmentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findById: FindDrainageSegmentByIdUseCase,
  ) {}

  async execute(
    dto: CreateDrainageSegmentDto,
  ): Promise<DrainageSegmentResponseDto> {
    const err = validateLineString(dto.points);
    if (err) throw new BadRequestException(`points: ${err}`);

    const pointsJson = JSON.stringify(dto.points);

    const inserted = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO drainage_segments (
        id, name, points, drainage_type, condition, length,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${dto.name},
        ST_GeomFromGeoJSON(${pointsJson}),
        ${dto.drainage_type}::"DrainageType",
        ${dto.condition}::"DrainageCondition",
        ${dto.length},
        NOW(), NOW()
      )
      RETURNING id
    `;

    return this.findById.execute(inserted[0].id);
  }
}
