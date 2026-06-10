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
  CreateDrainageSegmentDto,
  DrainageSegmentResponseDto,
  UpdateDrainageSegmentDto,
} from './dto';
import {
  CreateDrainageSegmentUseCase,
  FindAllDrainageSegmentsUseCase,
  FindDrainageSegmentByIdUseCase,
  RemoveDrainageSegmentUseCase,
  UpdateDrainageSegmentUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('Drainage Segments')
@Controller('drainage-segments')
export class DrainageSegmentController {
  constructor(
    private readonly findAll: FindAllDrainageSegmentsUseCase,
    private readonly findById: FindDrainageSegmentByIdUseCase,
    private readonly createUseCase: CreateDrainageSegmentUseCase,
    private readonly updateUseCase: UpdateDrainageSegmentUseCase,
    private readonly removeUseCase: RemoveDrainageSegmentUseCase,
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

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create drainage segment (Admin only)' })
  @ApiResponse({ status: 201, type: DrainageSegmentResponseDto })
  @ResponseMessage('Success create drainage segment')
  create(@Body() dto: CreateDrainageSegmentDto) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update drainage segment (Admin only)' })
  @ApiParam({ name: 'id', description: 'Drainage Segment UUID' })
  @ApiResponse({ status: 200, type: DrainageSegmentResponseDto })
  @ApiResponse({ status: 404, description: 'Drainage segment not found' })
  @ResponseMessage('Success update drainage segment')
  update(@Param('id') id: string, @Body() dto: UpdateDrainageSegmentDto) {
    return this.updateUseCase.execute({ id, dto });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete drainage segment (Admin only)' })
  @ApiParam({ name: 'id', description: 'Drainage Segment UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Drainage segment not found' })
  @ResponseMessage('Success delete drainage segment')
  remove(@Param('id') id: string) {
    return this.removeUseCase.execute(id);
  }
}
