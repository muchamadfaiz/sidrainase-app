import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../common';
import { FloodZoneResponseDto } from './dto';
import {
  FindAllFloodZonesUseCase,
  FindFloodZoneByIdUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('Flood Zones')
@Controller('flood-zones')
export class FloodZoneController {
  constructor(
    private readonly findAll: FindAllFloodZonesUseCase,
    private readonly findById: FindFloodZoneByIdUseCase,
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
}
