import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  validateLineString,
  validatePolygon,
} from '../../../common/utils/postgis.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainagePointResponseDto, UpdateDrainagePointDto } from '../dto';
import { FindDrainagePointByIdUseCase } from './find-drainage-point-by-id.use-case';

@Injectable()
export class UpdateDrainagePointUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findById: FindDrainagePointByIdUseCase,
  ) {}

  async execute(input: {
    id: string;
    dto: UpdateDrainagePointDto;
  }): Promise<DrainagePointResponseDto> {
    const { id, dto } = input;

    // Existence check
    const existing = await this.prisma.drainagePoint.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Drainage point not found');
    }

    if (dto.polygon_coords !== undefined && dto.polyline_coords !== undefined) {
      if (dto.polygon_coords && dto.polyline_coords) {
        throw new BadRequestException(
          'polygon_coords and polyline_coords are mutually exclusive',
        );
      }
    }
    if (dto.polygon_coords) {
      const err = validatePolygon(dto.polygon_coords);
      if (err) throw new BadRequestException(`polygon_coords: ${err}`);
    }
    if (dto.polyline_coords) {
      const err = validateLineString(dto.polyline_coords);
      if (err) throw new BadRequestException(`polyline_coords: ${err}`);
    }

    const updates: Prisma.Sql[] = [];
    if (dto.name !== undefined) updates.push(Prisma.sql`name = ${dto.name}`);
    if (dto.lat !== undefined) updates.push(Prisma.sql`lat = ${dto.lat}`);
    if (dto.lng !== undefined) updates.push(Prisma.sql`lng = ${dto.lng}`);
    if (dto.drainage_type !== undefined)
      updates.push(Prisma.sql`drainage_type = ${dto.drainage_type}::"DrainageType"`);
    if (dto.condition !== undefined)
      updates.push(Prisma.sql`condition = ${dto.condition}`);
    if (dto.infrastructure_type !== undefined)
      updates.push(Prisma.sql`infrastructure_type = ${dto.infrastructure_type}`);
    if (dto.length !== undefined) updates.push(Prisma.sql`length = ${dto.length}`);
    if (dto.width !== undefined) updates.push(Prisma.sql`width = ${dto.width}`);
    if (dto.depth !== undefined) updates.push(Prisma.sql`depth = ${dto.depth}`);
    if (dto.last_inspection !== undefined)
      updates.push(Prisma.sql`last_inspection = ${dto.last_inspection}::date`);
    if (dto.district !== undefined)
      updates.push(Prisma.sql`district = ${dto.district}`);
    if (dto.description !== undefined)
      updates.push(Prisma.sql`description = ${dto.description}`);
    if (dto.polygon_coords !== undefined) {
      const json = dto.polygon_coords ? JSON.stringify(dto.polygon_coords) : null;
      updates.push(
        json
          ? Prisma.sql`polygon_coords = ST_GeomFromGeoJSON(${json})`
          : Prisma.sql`polygon_coords = NULL`,
      );
    }
    if (dto.polyline_coords !== undefined) {
      const json = dto.polyline_coords ? JSON.stringify(dto.polyline_coords) : null;
      updates.push(
        json
          ? Prisma.sql`polyline_coords = ST_GeomFromGeoJSON(${json})`
          : Prisma.sql`polyline_coords = NULL`,
      );
    }

    if (updates.length === 0) {
      // No-op — return current state
      return this.findById.execute(id);
    }

    updates.push(Prisma.sql`updated_at = NOW()`);

    await this.prisma.$executeRaw`
      UPDATE drainage_points
      SET ${Prisma.join(updates, ', ')}
      WHERE id = ${id}
    `;

    return this.findById.execute(id);
  }
}
