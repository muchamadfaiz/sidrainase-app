import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, Roles } from '../../common';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { UpdatePublicAccessDto } from './dto/update-public-access.dto';
import { PublicAccessGuard } from './public-access.guard';
import { SettingsService } from './settings.service';

@ApiBearerAuth()
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('colors')
  @ApiOperation({ summary: 'Ambil warna kondisi/tipe (berbagi semua user)' })
  @ResponseMessage('Success get colors')
  getColors() {
    return this.settings.getColors();
  }

  @Put('colors')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Set warna kondisi/tipe (Admin only)' })
  @ResponseMessage('Success update colors')
  setColors(@Body() dto: UpdateColorsDto) {
    return this.settings.setColors(dto);
  }

  @Get('general')
  @ApiOperation({ summary: 'Ambil setelan umum (basemap default, dll)' })
  @ResponseMessage('Success get general settings')
  getGeneral() {
    return this.settings.getGeneral();
  }

  @Put('general')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Set setelan umum (Admin only)' })
  @ResponseMessage('Success update general settings')
  setGeneral(@Body() dto: UpdateGeneralDto) {
    return this.settings.setGeneral(dto);
  }

  @Get('public-access')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lihat kode akses link publik (Admin only)' })
  @ResponseMessage('Success get public access')
  getPublicAccess() {
    return this.settings.getPublicAccess();
  }

  @Put('public-access')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atur kode akses link publik (Admin only)' })
  @ResponseMessage('Success update public access')
  setPublicAccess(@Body() dto: UpdatePublicAccessDto) {
    return this.settings.setPublicAccess(dto);
  }

  /** Dipakai halaman /input buat mengecek kode sebelum menampilkan form. */
  @Post('public-access/verify')
  @Public()
  @UseGuards(PublicAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cek kode akses link publik (tanpa login)' })
  @ResponseMessage('Kode akses valid')
  verifyPublicAccess() {
    return { valid: true };
  }
}
