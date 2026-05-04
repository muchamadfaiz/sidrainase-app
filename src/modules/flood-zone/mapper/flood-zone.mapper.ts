import type { FloodZone } from '@prisma/client';
import { FloodZoneResponseDto } from '../dto';

export class FloodZoneMapper {
  static toResponseDto(zone: FloodZone): FloodZoneResponseDto {
    return {
      id: zone.id,
      name: zone.name,
      center_lat: zone.center_lat,
      center_lng: zone.center_lng,
      radius: zone.radius,
      severity: zone.severity,
      created_at: zone.created_at,
      updated_at: zone.updated_at,
    };
  }

  static toResponseDtoList(zones: FloodZone[]): FloodZoneResponseDto[] {
    return zones.map((z) => FloodZoneMapper.toResponseDto(z));
  }
}
