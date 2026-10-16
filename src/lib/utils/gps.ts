/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100; // in meters, rounded to 2 decimals
}

/**
 * Validates whether the user's GPS is within the acceptable radius of the venue.
 * Default max radius is 100 meters.
 */
export function isWithinVenueProximity(
  userLat: number,
  userLon: number,
  venueLat: number,
  venueLon: number,
  maxDistanceMeters: number = 100
): { isWithin: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(userLat, userLon, venueLat, venueLon);
  return {
    isWithin: distance <= maxDistanceMeters,
    distanceMeters: distance,
  };
}
