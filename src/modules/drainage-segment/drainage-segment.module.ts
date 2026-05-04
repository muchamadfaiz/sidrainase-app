import { Module } from '@nestjs/common';
import { DrainageSegmentController } from './drainage-segment.controller';
import {
  FindAllDrainageSegmentsUseCase,
  FindDrainageSegmentByIdUseCase,
} from './use-cases';

@Module({
  controllers: [DrainageSegmentController],
  providers: [FindAllDrainageSegmentsUseCase, FindDrainageSegmentByIdUseCase],
})
export class DrainageSegmentModule {}
