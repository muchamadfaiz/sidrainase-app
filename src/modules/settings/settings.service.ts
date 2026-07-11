import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateGeneralDto } from './dto/update-general.dto';

const COLORS_KEY = 'colors';
const GENERAL_KEY = 'general';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async get<T>(key: string): Promise<T> {
    const row = await this.prisma.appSetting.findUnique({ where: { key } });
    return (row?.value as T) ?? ({} as T);
  }

  private async set<T extends object>(key: string, dto: T): Promise<T> {
    const value = dto as unknown as Prisma.InputJsonValue;
    const row = await this.prisma.appSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return row.value as T;
  }

  /** Warna tersimpan (atau {} kalau belum pernah diset). FE merge dgn default. */
  getColors() {
    return this.get<UpdateColorsDto>(COLORS_KEY);
  }
  setColors(dto: UpdateColorsDto) {
    return this.set(COLORS_KEY, dto);
  }

  /** Setelan umum (basemap default, dll). */
  getGeneral() {
    return this.get<UpdateGeneralDto>(GENERAL_KEY);
  }
  setGeneral(dto: UpdateGeneralDto) {
    return this.set(GENERAL_KEY, dto);
  }
}
