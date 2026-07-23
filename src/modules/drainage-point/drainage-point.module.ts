import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings';
import { DrainagePointController } from './drainage-point.controller';
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

@Module({
  imports: [SettingsModule],
  controllers: [DrainagePointController],
  providers: [
    FindAllDrainagePointsUseCase,
    FindDrainagePointByIdUseCase,
    CreateDrainagePointUseCase,
    UpdateDrainagePointUseCase,
    RemoveDrainagePointUseCase,
    FindDrainageStatsUseCase,
    FindMapDrainagePointsUseCase,
  PublicSubmitDrainageUseCase,
  ],
})
export class DrainagePointModule {}
