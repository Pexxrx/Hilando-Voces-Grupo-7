import sjlBoundaryData from '@/data/sjl_boundary.json';

/**
 * Algoritmo Ray-Casting para verificar si un punto [lat, lng]
 * se encuentra dentro del polígono geográfico de San Juan de Lurigancho.
 */
export function isPointInSJL(latitude: number, longitude: number): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  // Bounding box rápido de San Juan de Lurigancho para descarte veloz
  // Lat: aprox [-12.06, -11.83], Lng: aprox [-77.06, -76.88]
  if (latitude < -12.10 || latitude > -11.80 || longitude < -77.10 || longitude > -76.85) {
    return false;
  }

  const geometry = sjlBoundaryData.geometry;
  
  if (geometry.type === 'Polygon') {
    return pointInPolygon([longitude, latitude], geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygonCoords: any) =>
      pointInPolygon([longitude, latitude], polygonCoords[0])
    );
  }

  return false;
}

/**
 * Algoritmo de Ray-Casting (Punto en Polígono)
 * @param point [longitude, latitude]
 * @param polygon Array de coordenadas [longitude, latitude]
 */
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
