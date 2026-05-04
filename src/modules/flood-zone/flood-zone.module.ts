import { Module } from '@nestjs/common';
import { FloodZoneController } from './flood-zone.controller';
import { FindAllFloodZonesUseCase, FindFloodZoneByIdUseCase } from './use-cases';

@Module({
  controllers: [FloodZoneController],
  providers: [FindAllFloodZonesUseCase, FindFloodZoneByIdUseCase],
})
export class FloodZoneModule {}
