import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, ResponseMessage, Roles } from '../../common';
import { PublicAccessGuard } from '../settings';
import {
  CreateDrainagePointDto,
  DrainageMapQueryDto,
  DrainagePointQueryDto,
  DrainagePointResponseDto,
  DrainageStatsResponseDto,
  UpdateDrainagePointDto,
} from './dto';
import {
  CreateDrainagePointUseCase,
  FindAllDrainagePointsUseCase,
  FindDrainagePointByIdUseCase,
  FindDrainageStatsUseCase,
  FindMapDrainagePointsUseCase,
  PublicSubmitDrainageUseCase,
  RemoveDrainagePointUseCase,
  UpdateDrainagePointUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('Drainage Points')
@Controller('drainage-points')
export class DrainagePointController {
  constructor(
    private readonly findAll: FindAllDrainagePointsUseCase,
    private readonly findById: FindDrainagePointByIdUseCase,
    private readonly createUseCase: CreateDrainagePointUseCase,
    private readonly updateUseCase: UpdateDrainagePointUseCase,
    private readonly removeUseCase: RemoveDrainagePointUseCase,
    private readonly statsUseCase: FindDrainageStatsUseCase,
    private readonly mapUseCase: FindMapDrainagePointsUseCase,
    private readonly publicSubmit: PublicSubmitDrainageUseCase,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Aggregated stats (total, by condition/type/district)' })
  @ApiResponse({ status: 200, type: DrainageStatsResponseDto })
  @ResponseMessage('Success get drainage stats')
  getStats() {
    return this.statsUseCase.execute();
  }

  @Get('map')
  @ApiOperation({ summary: 'Titik ringkas dalam viewport (bbox) buat peta, dibatasi limit' })
  @ResponseMessage('Success get map drainage points')
  map(@Query() query: DrainageMapQueryDto) {
    return this.mapUseCase.execute(query);
  }

  @Get()
  @ApiOperation({ summary: 'List drainage points (filter, sort, paginate)' })
  @ApiResponse({ status: 200, description: 'Paginated list of drainage points' })
  @ResponseMessage('Success get drainage points')
  list(@Query() query: DrainagePointQueryDto) {
    return this.findAll.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drainage point by ID' })
  @ApiParam({ name: 'id', description: 'Drainage Point UUID' })
  @ApiResponse({ status: 200, type: DrainagePointResponseDto })
  @ApiResponse({ status: 404, description: 'Drainage point not found' })
  @ResponseMessage('Success get drainage point')
  detail(@Param('id') id: string) {
    return this.findById.execute(id);
  }

  @Post('public')
  @Public()
  @UseGuards(PublicAccessGuard)
  @ApiOperation({
    summary: 'Tambah data dari link publik /input (butuh kode akses)',
  })
  @ApiResponse({ status: 201, type: DrainagePointResponseDto })
  @ResponseMessage('Data tersimpan')
  publicCreate(
    @Body() dto: CreateDrainagePointDto,
    @Headers('x-submitter-name') name?: string,
    @Headers('x-submitter-phone') phone?: string,
  ) {
    return this.publicSubmit.create(dto, { name, phone });
  }

  @Patch('public/:id')
  @Public()
  @UseGuards(PublicAccessGuard)
  @ApiOperation({
    summary: 'Ubah data dari link publik /input (butuh kode akses, dicatat riwayat)',
  })
  @ApiParam({ name: 'id', description: 'Drainage Point UUID' })
  @ApiResponse({ status: 200, type: DrainagePointResponseDto })
  @ResponseMessage('Perubahan tersimpan')
  publicUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateDrainagePointDto,
    @Headers('x-submitter-name') name?: string,
    @Headers('x-submitter-phone') phone?: string,
  ) {
    return this.publicSubmit.update(id, dto, { name, phone });
  }

  @Post()
  @ApiOperation({ summary: 'Create drainage point (semua user login, mis. surveyor)' })
  @ApiResponse({ status: 201, type: DrainagePointResponseDto })
  @ApiResponse({ status: 409, description: 'drainage_id already exists' })
  @ResponseMessage('Success create drainage point')
  create(@Body() dto: CreateDrainagePointDto) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update drainage point (Admin only)' })
  @ApiParam({ name: 'id', description: 'Drainage Point UUID' })
  @ApiResponse({ status: 200, type: DrainagePointResponseDto })
  @ApiResponse({ status: 404, description: 'Drainage point not found' })
  @ResponseMessage('Success update drainage point')
  update(@Param('id') id: string, @Body() dto: UpdateDrainagePointDto) {
    return this.updateUseCase.execute({ id, dto });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete drainage point (Admin only)' })
  @ApiParam({ name: 'id', description: 'Drainage Point UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Drainage point not found' })
  @ResponseMessage('Success delete drainage point')
  remove(@Param('id') id: string) {
    return this.removeUseCase.execute(id);
  }
}
