import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SettingsService } from './settings.service';

export const ACCESS_CODE_HEADER = 'x-access-code';

/**
 * Penjaga endpoint publik (/input): request harus membawa kode akses yang benar
 * di header `x-access-code`. Kode diatur admin lewat Pengaturan dan disimpan di DB,
 * jadi bisa diganti kapan saja tanpa deploy ulang.
 */
@Injectable()
export class PublicAccessGuard implements CanActivate {
  constructor(private readonly settings: SettingsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const code =
      req.headers?.[ACCESS_CODE_HEADER] ?? req.query?.code ?? undefined;

    const ok = await this.settings.isValidPublicCode(
      Array.isArray(code) ? code[0] : code,
    );
    if (!ok) {
      throw new ForbiddenException(
        'Kode akses tidak berlaku. Minta kode terbaru ke admin.',
      );
    }
    return true;
  }
}
