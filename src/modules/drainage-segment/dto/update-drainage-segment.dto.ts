import { PartialType } from '@nestjs/swagger';
import { CreateDrainageSegmentDto } from './create-drainage-segment.dto';

export class UpdateDrainageSegmentDto extends PartialType(
  CreateDrainageSegmentDto,
) {}
