import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDrainagePointDto } from './create-drainage-point.dto';

// drainage_id tidak bisa diubah saat edit (sesuai FE — input disabled di edit mode)
export class UpdateDrainagePointDto extends PartialType(
  OmitType(CreateDrainagePointDto, ['drainage_id'] as const),
) {}
