import { Module } from '@nestjs/common';
import { DrainagePointController } from './drainage-point.controller';
import {
  CreateDrainagePointUseCase,
  FindAllDrainagePointsUseCase,
  FindDrainagePointByIdUseCase,
  FindDrainageStatsUseCase,
  FindMapDrainagePointsUseCase,
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
    FindMapDrainagePointsUseCase,
  ],
})
export class DrainagePointModule {}
