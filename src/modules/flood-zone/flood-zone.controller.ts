import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage, Roles } from '../../common';
import {
  CreateFloodZoneDto,
  FloodZoneResponseDto,
  UpdateFloodZoneDto,
} from './dto';
import {
  CreateFloodZoneUseCase,
  FindAllFloodZonesUseCase,
  FindFloodZoneByIdUseCase,
  RemoveFloodZoneUseCase,
  UpdateFloodZoneUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('Flood Zones')
@Controller('flood-zones')
export class FloodZoneController {
  constructor(
    private readonly findAll: FindAllFloodZonesUseCase,
    private readonly findById: FindFloodZoneByIdUseCase,
    private readonly createUseCase: CreateFloodZoneUseCase,
    private readonly updateUseCase: UpdateFloodZoneUseCase,
    private readonly removeUseCase: RemoveFloodZoneUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all flood zones' })
  @ApiResponse({ status: 200, type: [FloodZoneResponseDto] })
  @ResponseMessage('Success get flood zones')
  list() {
    return this.findAll.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flood zone by ID' })
  @ApiParam({ name: 'id', description: 'Flood Zone UUID' })
  @ApiResponse({ status: 200, type: FloodZoneResponseDto })
  @ApiResponse({ status: 404, description: 'Flood zone not found' })
  @ResponseMessage('Success get flood zone')
  detail(@Param('id') id: string) {
    return this.findById.execute(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create flood zone (Admin only)' })
  @ApiResponse({ status: 201, type: FloodZoneResponseDto })
  @ResponseMessage('Success create flood zone')
  create(@Body() dto: CreateFloodZoneDto) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update flood zone (Admin only)' })
  @ApiParam({ name: 'id', description: 'Flood Zone UUID' })
  @ApiResponse({ status: 200, type: FloodZoneResponseDto })
  @ApiResponse({ status: 404, description: 'Flood zone not found' })
  @ResponseMessage('Success update flood zone')
  update(@Param('id') id: string, @Body() dto: UpdateFloodZoneDto) {
    return this.updateUseCase.execute({ id, dto });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flood zone (Admin only)' })
  @ApiParam({ name: 'id', description: 'Flood Zone UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Flood zone not found' })
  @ResponseMessage('Success delete flood zone')
  remove(@Param('id') id: string) {
    return this.removeUseCase.execute(id);
  }
}
