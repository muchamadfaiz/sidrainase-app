import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageMetaDto } from '../../../common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  DrainagePointQueryDto,
  DrainagePointResponseDto,
} from '../dto';
import {
  DrainagePointMapper,
  DrainagePointRawRow,
} from '../mapper/drainage-point.mapper';

const ALLOWED_SORT_FIELDS = new Set([
  'name',
  'length',
  'condition',
  'district',
  'last_inspection',
  'created_at',
]);

@Injectable()
export class FindAllDrainagePointsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: DrainagePointQueryDto,
  ): Promise<{ data: DrainagePointResponseDto[]; meta: PageMetaDto }> {
    const conditions: Prisma.Sql[] = [];

    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        Prisma.sql`(name ILIKE ${pattern} OR drainage_id ILIKE ${pattern} OR district ILIKE ${pattern})`,
      );
    }
    if (query.condition) {
      conditions.push(Prisma.sql`condition = ${query.condition}`);
    }
    if (query.drainage_type) {
      conditions.push(Prisma.sql`drainage_type = ${query.drainage_type}::"DrainageType"`);
    }
    if (query.district) {
      conditions.push(Prisma.sql`district = ${query.district}`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sortField = ALLOWED_SORT_FIELDS.has(query.sortBy ?? '')
      ? query.sortBy!
      : 'created_at';
    const sortOrder = query.order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    const [rows, totalRow] = await Promise.all([
      this.prisma.$queryRaw<DrainagePointRawRow[]>`
        SELECT
          id, drainage_id, name, lat, lng,
          drainage_type::text AS drainage_type,
          condition::text AS condition,
          infrastructure_type,
          length, width, depth, last_inspection, district, description,
          ST_AsGeoJSON(polygon_coords)::json AS polygon_coords,
          ST_AsGeoJSON(polyline_coords)::json AS polyline_coords,
          created_at, updated_at
        FROM drainage_points
        ${whereClause}
        ORDER BY ${Prisma.raw(`"${sortField}"`)} ${sortOrder}
        LIMIT ${query.limit}
        OFFSET ${query.skip}
      `,
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM drainage_points
        ${whereClause}
      `,
    ]);

    const totalData = Number(totalRow[0]?.count ?? 0);

    return {
      data: DrainagePointMapper.toResponseDtoList(rows),
      meta: new PageMetaDto({
        page: query.page,
        limit: query.limit,
        totalData,
      }),
    };
  }
}
