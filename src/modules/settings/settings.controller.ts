import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, Roles } from '../../common';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateGeneralDto } from './dto/update-general.dto';
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
}
