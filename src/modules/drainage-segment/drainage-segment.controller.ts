import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../common';
import { DrainageSegmentResponseDto } from './dto';
import {
  FindAllDrainageSegmentsUseCase,
  FindDrainageSegmentByIdUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('Drainage Segments')
@Controller('drainage-segments')
export class DrainageSegmentController {
  constructor(
    private readonly findAll: FindAllDrainageSegmentsUseCase,
    private readonly findById: FindDrainageSegmentByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all drainage segments' })
  @ApiResponse({ status: 200, type: [DrainageSegmentResponseDto] })
  @ResponseMessage('Success get drainage segments')
  list() {
    return this.findAll.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drainage segment by ID' })
  @ApiParam({ name: 'id', description: 'Drainage Segment UUID' })
  @ApiResponse({ status: 200, type: DrainageSegmentResponseDto })
  @ApiResponse({ status: 404, description: 'Drainage segment not found' })
  @ResponseMessage('Success get drainage segment')
  detail(@Param('id') id: string) {
    return this.findById.execute(id);
  }
}
