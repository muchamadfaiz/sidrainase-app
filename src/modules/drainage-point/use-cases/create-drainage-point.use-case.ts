import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  validateLineString,
  validatePolygon,
} from '../../../common/utils/postgis.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDrainagePointDto, DrainagePointResponseDto } from '../dto';
import { FindDrainagePointByIdUseCase } from './find-drainage-point-by-id.use-case';

const DRAINAGE_ID_PATTERN = /^D(\d{3,})$/;

@Injectable()
export class CreateDrainagePointUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findById: FindDrainagePointByIdUseCase,
  ) {}

  async execute(dto: CreateDrainagePointDto): Promise<DrainagePointResponseDto> {
    if (dto.polygon_coords && dto.polyline_coords) {
      throw new BadRequestException(
        'polygon_coords and polyline_coords are mutually exclusive',
      );
    }
    if (dto.polygon_coords) {
      const err = validatePolygon(dto.polygon_coords);
      if (err) throw new BadRequestException(`polygon_coords: ${err}`);
    }
    if (dto.polyline_coords) {
      const err = validateLineString(dto.polyline_coords);
      if (err) throw new BadRequestException(`polyline_coords: ${err}`);
    }

    const drainageCode =
      dto.drainage_id ?? (await this.generateNextDrainageId());

    if (dto.drainage_id) {
      const existing = await this.prisma.drainagePoint.findUnique({
        where: { drainage_id: drainageCode },
      });
      if (existing) {
        throw new ConflictException('drainage_id already exists');
      }
    }

    const polygonJson = dto.polygon_coords
      ? JSON.stringify(dto.polygon_coords)
      : null;
    const polylineJson = dto.polyline_coords
      ? JSON.stringify(dto.polyline_coords)
      : null;

    const inserted = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO drainage_points (
        id, drainage_id, name, lat, lng,
        drainage_type, condition, infrastructure_type, activity_type, job_number,
        length, width, depth,
        last_inspection, district, description,
        polygon_coords, polyline_coords,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${drainageCode},
        ${dto.name},
        ${dto.lat},
        ${dto.lng},
        ${dto.drainage_type}::"DrainageType",
        ${dto.condition},
        ${dto.infrastructure_type ?? null},
        ${dto.activity_type ?? null},
        ${dto.job_number ?? null},
        ${dto.length},
        ${dto.width},
        ${dto.depth},
        ${dto.last_inspection}::date,
        ${dto.district},
        ${dto.description ?? null},
        ${polygonJson ? Prisma.sql`ST_GeomFromGeoJSON(${polygonJson})` : Prisma.sql`NULL`},
        ${polylineJson ? Prisma.sql`ST_GeomFromGeoJSON(${polylineJson})` : Prisma.sql`NULL`},
        NOW(), NOW()
      )
      RETURNING id
    `;

    const id = inserted[0].id;
    if (dto.photo_file_ids?.length) {
      await this.prisma.drainagePhoto.createMany({
        data: dto.photo_file_ids.map((fileId) => ({ drainagePointId: id, fileId })),
      });
    }

    return this.findById.execute(id);
  }

  /**
   * Generate next drainage_id by querying MAX of existing "D###" codes.
   * Race-condition: jika dua request bersamaan, salah satunya akan kena
   * unique constraint violation (di-handle level DB) — caller bisa retry.
   */
  private async generateNextDrainageId(): Promise<string> {
    const all = await this.prisma.drainagePoint.findMany({
      select: { drainage_id: true },
    });
    let maxNum = 0;
    for (const { drainage_id } of all) {
      const m = drainage_id.match(DRAINAGE_ID_PATTERN);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    return `D${String(maxNum + 1).padStart(3, '0')}`;
  }
}
