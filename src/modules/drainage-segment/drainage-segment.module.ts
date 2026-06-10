import { Module } from '@nestjs/common';
import { DrainageSegmentController } from './drainage-segment.controller';
import {
  CreateDrainageSegmentUseCase,
  FindAllDrainageSegmentsUseCase,
  FindDrainageSegmentByIdUseCase,
  RemoveDrainageSegmentUseCase,
  UpdateDrainageSegmentUseCase,
} from './use-cases';

@Module({
  controllers: [DrainageSegmentController],
  providers: [
    FindAllDrainageSegmentsUseCase,
    FindDrainageSegmentByIdUseCase,
    CreateDrainageSegmentUseCase,
    UpdateDrainageSegmentUseCase,
    RemoveDrainageSegmentUseCase,
  ],
})
export class DrainageSegmentModule {}
