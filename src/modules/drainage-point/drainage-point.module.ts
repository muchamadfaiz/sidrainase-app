import { Module } from '@nestjs/common';
import { DrainagePointController } from './drainage-point.controller';
import {
  CreateDrainagePointUseCase,
  FindAllDrainagePointsUseCase,
  FindDrainagePointByIdUseCase,
  FindDrainageStatsUseCase,
  RemoveDrainagePointUseCase,
  UpdateDrainagePointUseCase,
} from './use-cases';

@Module({
  controllers: [DrainagePointController],
  providers: [
    FindAllDrainagePointsUseCase,
    FindDrainagePointByIdUseCase,
    CreateDrainagePointUseCase,
    UpdateDrainagePointUseCase,
    RemoveDrainagePointUseCase,
    FindDrainageStatsUseCase,
  ],
})
export class DrainagePointModule {}
