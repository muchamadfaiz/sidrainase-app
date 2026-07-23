import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PublicAccessGuard } from './public-access.guard';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PublicAccessGuard],
  exports: [SettingsService, PublicAccessGuard],
})
export class SettingsModule {}
