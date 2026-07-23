import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateDrainagePointDto,
  DrainagePointResponseDto,
  UpdateDrainagePointDto,
} from '../dto';
import { CreateDrainagePointUseCase } from './create-drainage-point.use-case';
import { UpdateDrainagePointUseCase } from './update-drainage-point.use-case';
import { FindDrainagePointByIdUseCase } from './find-drainage-point-by-id.use-case';

export interface Submitter {
  name?: string;
  phone?: string;
}

/** Field yg ditampilkan di riwayat (selain geometri & foto yg terlalu panjang). */
const TRACKED: (keyof UpdateDrainagePointDto)[] = [
  'name',
  'drainage_type',
  'condition',
  'infrastructure_type',
  'activity_type',
  'job_number',
  'length',
  'width',
  'depth',
  'district',
  'description',
  'last_inspection',
];

/**
 * Kiriman dari link publik (/input) yang dilindungi kode akses.
 * - Tambah: data masuk sebagai "pending" (menunggu verifikasi admin).
 * - Edit: data yg sudah ada boleh diubah, TAPI setiap perubahan dicatat di
 *   tabel riwayat lengkap dgn nama & no. HP pengirim, supaya bisa dilacak.
 */
@Injectable()
export class PublicSubmitDrainageUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateDrainagePointUseCase,
    private readonly updateUseCase: UpdateDrainagePointUseCase,
    private readonly findById: FindDrainagePointByIdUseCase,
  ) {}

  async create(
    dto: CreateDrainagePointDto,
    who: Submitter,
  ): Promise<DrainagePointResponseDto> {
    const created = await this.createUseCase.execute(dto);

    // Data dari link publik langsung dianggap resmi (gerbangnya kode akses),
    // cuma simpan jejak pengirim buat pelacakan.
    await this.prisma.$executeRaw`
      UPDATE drainage_points
      SET submitter_name = ${who.name ?? null},
          submitter_phone = ${who.phone ?? null}
      WHERE id = ${created.id}
    `;

    await this.audit(created.id, 'create', who, null);
    return this.findById.execute(created.id);
  }

  async update(
    id: string,
    dto: UpdateDrainagePointDto,
    who: Submitter,
  ): Promise<DrainagePointResponseDto> {
    const before = await this.prisma.drainagePoint.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Drainage point not found');

    const updated = await this.updateUseCase.execute({ id, dto });

    // Catat hanya field yg benar-benar berubah
    const changes: Record<string, { dari: unknown; jadi: unknown }> = {};
    for (const f of TRACKED) {
      const baru = (dto as Record<string, unknown>)[f];
      if (baru === undefined) continue;
      const lama = (before as unknown as Record<string, unknown>)[f];
      if (String(lama ?? '') !== String(baru ?? '')) {
        changes[f] = { dari: lama ?? null, jadi: baru ?? null };
      }
    }

    await this.audit(id, 'update', who, changes);
    return updated;
  }

  private audit(
    drainagePointId: string,
    action: 'create' | 'update',
    who: Submitter,
    changes: Record<string, unknown> | null,
  ) {
    return this.prisma.drainageAudit.create({
      data: {
        drainagePointId,
        action,
        source: 'public',
        actor_name: who.name ?? null,
        actor_phone: who.phone ?? null,
        changes: (changes ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
