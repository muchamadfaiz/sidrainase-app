import { PartialType } from '@nestjs/swagger';
import { CreateFloodZoneDto } from './create-flood-zone.dto';

export class UpdateFloodZoneDto extends PartialType(CreateFloodZoneDto) {}
