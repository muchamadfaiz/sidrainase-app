import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainagePointResponseDto } from '../dto';
import {
  DrainagePointMapper,
  DrainagePointRawRow,
} from '../mapper/drainage-point.mapper';

@Injectable()
export class FindDrainagePointByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<DrainagePointResponseDto> {
    const rows = await this.prisma.$queryRaw<DrainagePointRawRow[]>`
      SELECT
        id, drainage_id, name, lat, lng,
        drainage_type::text AS drainage_type,
        condition::text AS condition,
        infrastructure_type, activity_type,
        length, width, depth, last_inspection, district, description,
        ST_AsGeoJSON(polygon_coords)::json AS polygon_coords,
        ST_AsGeoJSON(polyline_coords)::json AS polyline_coords,
        created_at, updated_at
      FROM drainage_points
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      throw new NotFoundException('Drainage point not found');
    }

    const dto = DrainagePointMapper.toResponseDto(rows[0]);
    const photos = await this.prisma.drainagePhoto.findMany({
      where: { drainagePointId: id },
      include: { file: true },
      orderBy: { createdAt: 'asc' },
    });
    dto.photos = photos.map((p) => ({ id: p.id, url: p.file.url }));
    return dto;
  }
}
