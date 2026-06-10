import { Module } from '@nestjs/common';
import { FloodZoneController } from './flood-zone.controller';
import {
  CreateFloodZoneUseCase,
  FindAllFloodZonesUseCase,
  FindFloodZoneByIdUseCase,
  RemoveFloodZoneUseCase,
  UpdateFloodZoneUseCase,
} from './use-cases';

@Module({
  controllers: [FloodZoneController],
  providers: [
    FindAllFloodZonesUseCase,
    FindFloodZoneByIdUseCase,
    CreateFloodZoneUseCase,
    UpdateFloodZoneUseCase,
    RemoveFloodZoneUseCase,
  ],
})
export class FloodZoneModule {}
