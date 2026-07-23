import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { UpdatePublicAccessDto } from './dto/update-public-access.dto';

const COLORS_KEY = 'colors';
const GENERAL_KEY = 'general';
const PUBLIC_ACCESS_KEY = 'public_access';

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

  /** Kode akses link publik — dipakai guard, JANGAN diekspos ke non-admin. */
  getPublicAccess() {
    return this.get<UpdatePublicAccessDto>(PUBLIC_ACCESS_KEY);
  }
  async setPublicAccess(dto: UpdatePublicAccessDto) {
    // Gabung dgn nilai lama supaya ubah `enabled` saja tidak menghapus `code`
    const current = await this.getPublicAccess();
    return this.set(PUBLIC_ACCESS_KEY, { ...current, ...dto });
  }

  /** Validasi kode dari pengguna link publik. */
  async isValidPublicCode(code?: string): Promise<boolean> {
    const cfg = await this.getPublicAccess();
    if (!cfg?.enabled || !cfg?.code) return false;
    if (!code) return false;
    // Panjang beda -> pasti salah; samakan panjang biar perbandingan konstan
    const a = Buffer.from(String(code));
    const b = Buffer.from(String(cfg.code));
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }
}
