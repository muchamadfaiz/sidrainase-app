import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DrainageStatsResponseDto } from '../dto';

@Injectable()
export class FindDrainageStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DrainageStatsResponseDto> {
    const [byCondition, byType, byDistrict, totals] = await Promise.all([
      this.prisma.drainagePoint.groupBy({
        by: ['condition'],
        _count: { _all: true },
      }),
      this.prisma.drainagePoint.groupBy({
        by: ['drainage_type'],
        _count: { _all: true },
      }),
      this.prisma.drainagePoint.groupBy({
        by: ['district'],
        _count: { _all: true },
        _sum: { length: true },
      }),
      this.prisma.drainagePoint.aggregate({
        _count: { _all: true },
        _sum: { length: true },
      }),
    ]);

    const conditionMap: Record<string, number> = {};
    for (const row of byCondition) {
      conditionMap[row.condition] = row._count._all;
    }

    const typeMap: Record<string, number> = {};
    for (const row of byType) {
      typeMap[row.drainage_type] = row._count._all;
    }

    const districtList = byDistrict
      .map((row) => ({
        district: row.district,
        count: row._count._all,
        total_length: row._sum.length ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total_points: totals._count._all,
      total_length_meters: totals._sum.length ?? 0,
      by_condition: conditionMap,
      by_type: typeMap,
      by_district: districtList,
    };
  }
}
