/**
 * PostGIS helpers for converting between API GeoJSON shapes and DB geometry.
 *
 * Convention: API uses GeoJSON ([lng, lat]), Leaflet/FE uses [lat, lng].
 * Service layer accepts/returns API GeoJSON. Map at service boundary if needed.
 */

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: number[][]; // [[lng, lat], [lng, lat], ...]
}

export type GeoJSONGeometry = GeoJSONPolygon | GeoJSONLineString;

/**
 * Validate a GeoJSON Polygon: at least 3 vertices, ring must be closed
 * (first vertex equals last vertex).
 */
export function validatePolygon(polygon: GeoJSONPolygon): string | null {
  if (polygon.type !== 'Polygon') return 'Type must be "Polygon"';
  const ring = polygon.coordinates?.[0];
  if (!Array.isArray(ring)) return 'coordinates[0] must be an array';
  if (ring.length < 4) return 'Polygon must have at least 3 vertices (4 points incl. closing)';
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return 'Polygon ring must be closed (first vertex must equal last vertex)';
  }
  return null;
}

/**
 * Validate a GeoJSON LineString: at least 2 points.
 */
export function validateLineString(line: GeoJSONLineString): string | null {
  if (line.type !== 'LineString') return 'Type must be "LineString"';
  if (!Array.isArray(line.coordinates)) return 'coordinates must be an array';
  if (line.coordinates.length < 2) return 'LineString must have at least 2 points';
  return null;
}
