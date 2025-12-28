/**
 * Map Utilities - Distance Calculations, Routes, Geocoding
 * Comprehensive helper functions for Mapbox integration
 */

import distance from '@turf/distance';
import circle from '@turf/circle';
import { point, polygon, lineString } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
// @ts-ignore - Types may not resolve due to package.json exports
import nearestPointOnLine from '@turf/nearest-point-on-line';
// @ts-ignore
import along from '@turf/along';
// @ts-ignore
import length from '@turf/length';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// =============================================================================
// TYPES
// =============================================================================

export interface Waypoint {
  coordinates: [number, number];
  name?: string;
  arrival?: number; // timestamp
  departure?: number; // timestamp
  stopDuration?: number; // seconds
}

export interface TrafficInfo {
  congestion: 'low' | 'moderate' | 'heavy' | 'severe' | 'unknown';
  freeFlowSpeed?: number;
  currentSpeed?: number;
  segments?: Array<{
    startIndex: number;
    endIndex: number;
    congestion: string;
  }>;
}

export interface EnhancedRouteResponse {
  distance: number; // meters
  duration: number; // seconds (without traffic)
  trafficDuration?: number; // seconds (with traffic)
  geometry: GeoJSON.LineString;
  steps?: RouteStep[];
  weight: number;
  legs: Array<{
    distance: number;
    duration: number;
    trafficDuration?: number;
    steps: RouteStep[];
    annotation?: {
      distance: number[];
      duration: number[];
      speed: number[];
      congestion?: string[];
    };
  }>;
  waypoints?: Waypoint[];
  traffic?: TrafficInfo;
  voiceLocale?: string;
}

export interface RouteDeviationInfo {
  isOnRoute: boolean;
  distanceFromRoute: number; // meters
  nearestPointOnRoute: [number, number];
  currentStep: number;
  shouldReroute: boolean;
}

// =============================================================================
// DISTANCE CALCULATIONS
// =============================================================================

/**
 * Calculate straight-line distance between two points (Haversine formula)
 * @param from [longitude, latitude]
 * @param to [longitude, latitude]
 * @returns Distance in kilometers
 */
export function calculateDistance(
  from: [number, number],
  to: [number, number]
): number {
  return distance(from, to, { units: 'kilometers' });
}

/**
 * Calculate driving distance using Mapbox Matrix API
 * @param from [longitude, latitude]
 * @param to [longitude, latitude]
 * @returns Promise<{ distance: number; duration: number }>
 */
export async function calculateDrivingDistance(
  from: [number, number],
  to: [number, number]
): Promise<{ distance: number; duration: number } | null> {
  try {
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}`;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      annotations: 'distance,duration',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.distances && data.durations) {
      return {
        distance: data.distances[0][1] / 1000, // Convert meters to kilometers
        duration: data.durations[0][1] / 60, // Convert seconds to minutes
      };
    }
    return null;
  } catch (error) {
    console.error('Error calculating driving distance:', error);
    return null;
  }
}

// =============================================================================
// ROUTE FETCHING & DIRECTIONS
// =============================================================================

export interface RouteOptions {
  profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline' | 'polyline6';
  overview?: 'full' | 'simplified' | 'false';
  language?: 'en' | 'bn';
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
    bearing_before: number;
    bearing_after: number;
  };
}

export interface RouteResponse {
  distance: number; // meters
  duration: number; // seconds
  geometry: GeoJSON.LineString;
  steps?: RouteStep[];
  weight: number;
  legs: Array<{
    distance: number;
    duration: number;
    steps: RouteStep[];
  }>;
}

/**
 * Get directions from start to end using Mapbox Directions API
 * @param start [longitude, latitude]
 * @param end [longitude, latitude]
 * @param options Route options
 * @returns Promise<RouteResponse | null>
 */
export async function getDirections(
  start: [number, number],
  end: [number, number],
  options: RouteOptions = {}
): Promise<RouteResponse | null> {
  try {
    const {
      profile = 'driving',
      alternatives = false,
      steps = true,
      geometries = 'geojson',
      overview = 'full',
      language = 'en',
    } = options;

    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      alternatives: alternatives.toString(),
      steps: steps.toString(),
      geometries,
      overview,
      language,
      banner_instructions: 'true',
      voice_instructions: 'true',
      annotations: 'duration,distance,speed',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
}

// =============================================================================
// TRAFFIC-AWARE ROUTING
// =============================================================================

/**
 * Get directions with real-time traffic data
 * Uses driving-traffic profile for accurate ETAs
 * @param start [longitude, latitude]
 * @param end [longitude, latitude]
 * @param options Additional options
 * @returns Promise<EnhancedRouteResponse | null>
 */
export async function getTrafficAwareDirections(
  start: [number, number],
  end: [number, number],
  options: {
    departureTime?: Date;
    language?: 'en' | 'bn';
    alternatives?: boolean;
  } = {}
): Promise<EnhancedRouteResponse | null> {
  try {
    const { departureTime, language = 'en', alternatives = true } = options;
    
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      alternatives: alternatives.toString(),
      steps: 'true',
      geometries: 'geojson',
      overview: 'full',
      language,
      banner_instructions: 'true',
      voice_instructions: 'true',
      annotations: 'duration,distance,speed,congestion,congestion_numeric',
    });

    if (departureTime) {
      params.append('depart_at', departureTime.toISOString());
    }

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Calculate traffic info from annotations
      const congestionData = route.legs[0]?.annotation?.congestion || [];
      const traffic = calculateTrafficInfo(congestionData);
      
      return {
        ...route,
        trafficDuration: route.duration, // driving-traffic already includes traffic
        traffic,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching traffic-aware directions:', error);
    return null;
  }
}

/**
 * Calculate overall traffic info from congestion data
 */
function calculateTrafficInfo(congestionData: string[]): TrafficInfo {
  if (!congestionData.length) {
    return { congestion: 'unknown' };
  }
  
  const counts = {
    low: 0,
    moderate: 0,
    heavy: 0,
    severe: 0,
    unknown: 0,
  };
  
  congestionData.forEach(c => {
    if (c in counts) {
      counts[c as keyof typeof counts]++;
    }
  });
  
  const total = congestionData.length;
  const heavyPercent = ((counts.heavy + counts.severe) / total) * 100;
  const moderatePercent = (counts.moderate / total) * 100;
  
  let overallCongestion: TrafficInfo['congestion'] = 'low';
  if (heavyPercent > 30) overallCongestion = 'severe';
  else if (heavyPercent > 15) overallCongestion = 'heavy';
  else if (moderatePercent > 30) overallCongestion = 'moderate';
  
  return {
    congestion: overallCongestion,
    segments: congestionData.map((congestion, i) => ({
      startIndex: i,
      endIndex: i + 1,
      congestion,
    })),
  };
}

// =============================================================================
// WAYPOINT ROUTING
// =============================================================================

/**
 * Get directions with multiple waypoints
 * @param coordinates Array of [longitude, latitude] coordinates (start, waypoints..., end)
 * @param options Route options
 * @returns Promise<EnhancedRouteResponse | null>
 */
export async function getDirectionsWithWaypoints(
  coordinates: Array<[number, number]>,
  options: {
    profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
    language?: 'en' | 'bn';
    optimizeOrder?: boolean;
  } = {}
): Promise<EnhancedRouteResponse | null> {
  if (coordinates.length < 2) {
    console.error('At least 2 coordinates required');
    return null;
  }
  
  try {
    const { profile = 'driving-traffic', language = 'en', optimizeOrder = false } = options;
    
    const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsString}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      steps: 'true',
      geometries: 'geojson',
      overview: 'full',
      language,
      annotations: 'duration,distance,speed,congestion',
    });

    // If optimizeOrder is true, use the Optimization API instead
    if (optimizeOrder && coordinates.length > 2) {
      return await getOptimizedRoute(coordinates, { profile, language });
    }

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return {
        ...data.routes[0],
        waypoints: data.waypoints?.map((wp: any, i: number) => ({
          coordinates: wp.location as [number, number],
          name: wp.name,
        })),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching directions with waypoints:', error);
    return null;
  }
}

// =============================================================================
// ROUTE OPTIMIZATION (TSP - Traveling Salesman Problem)
// =============================================================================

/**
 * Optimize route order for multiple stops (uses Mapbox Optimization API)
 * @param coordinates Array of [longitude, latitude] - first is start, last is end
 * @param options Optimization options
 * @returns Promise<EnhancedRouteResponse | null>
 */
export async function getOptimizedRoute(
  coordinates: Array<[number, number]>,
  options: {
    profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
    language?: 'en' | 'bn';
    roundTrip?: boolean;
    source?: 'first' | 'any';
    destination?: 'last' | 'any';
  } = {}
): Promise<EnhancedRouteResponse | null> {
  if (coordinates.length < 2 || coordinates.length > 12) {
    console.error('Optimization requires 2-12 coordinates');
    return null;
  }
  
  try {
    const {
      profile = 'driving',
      language = 'en',
      roundTrip = false,
      source = 'first',
      destination = 'last',
    } = options;
    
    const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordsString}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      steps: 'true',
      language,
      roundtrip: roundTrip.toString(),
      source,
      destination,
      annotations: 'duration,distance',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.trips && data.trips.length > 0) {
      const trip = data.trips[0];
      return {
        distance: trip.distance,
        duration: trip.duration,
        geometry: trip.geometry,
        legs: trip.legs,
        steps: trip.legs.flatMap((leg: any) => leg.steps || []),
        weight: trip.weight || 0,
        waypoints: data.waypoints?.map((wp: any) => ({
          coordinates: wp.location as [number, number],
          name: wp.name,
        })),
      };
    }
    return null;
  } catch (error) {
    console.error('Error optimizing route:', error);
    return null;
  }
}

// =============================================================================
// ROUTE DEVIATION DETECTION
// =============================================================================

const DEVIATION_THRESHOLD_METERS = 50; // Max distance from route before considered off-route
const REROUTE_THRESHOLD_METERS = 100; // Distance at which rerouting is recommended

/**
 * Check if a point is on the route and calculate deviation
 * @param currentPosition [longitude, latitude]
 * @param routeGeometry GeoJSON LineString of the route
 * @param currentStepIndex Current step in the navigation
 * @returns RouteDeviationInfo
 */
export function checkRouteDeviation(
  currentPosition: [number, number],
  routeGeometry: GeoJSON.LineString,
  currentStepIndex: number = 0
): RouteDeviationInfo {
  try {
    const currentPoint = point(currentPosition);
    const routeLine = lineString(routeGeometry.coordinates);
    
    // Find nearest point on route
    const nearestPoint = nearestPointOnLine(routeLine, currentPoint);
    const nearestCoords = nearestPoint.geometry.coordinates as [number, number];
    
    // Calculate distance from route in meters
    const distanceFromRoute = distance(currentPosition, nearestCoords, { units: 'meters' });
    
    const isOnRoute = distanceFromRoute <= DEVIATION_THRESHOLD_METERS;
    const shouldReroute = distanceFromRoute >= REROUTE_THRESHOLD_METERS;
    
    return {
      isOnRoute,
      distanceFromRoute,
      nearestPointOnRoute: nearestCoords,
      currentStep: currentStepIndex,
      shouldReroute,
    };
  } catch (error) {
    console.error('Error checking route deviation:', error);
    return {
      isOnRoute: true,
      distanceFromRoute: 0,
      nearestPointOnRoute: currentPosition,
      currentStep: currentStepIndex,
      shouldReroute: false,
    };
  }
}

/**
 * Calculate remaining distance and time on route from current position
 * @param currentPosition [longitude, latitude]
 * @param routeGeometry GeoJSON LineString
 * @param totalDistance Total route distance in meters
 * @param totalDuration Total route duration in seconds
 * @param averageSpeed Optional current average speed in m/s
 * @returns { remainingDistance, remainingDuration, progress }
 */
export function calculateRemainingRoute(
  currentPosition: [number, number],
  routeGeometry: GeoJSON.LineString,
  totalDistance: number,
  totalDuration: number,
  averageSpeed?: number
): {
  remainingDistance: number;
  remainingDuration: number;
  progress: number;
} {
  try {
    const routeLine = lineString(routeGeometry.coordinates);
    const currentPoint = point(currentPosition);
    
    // Find nearest point on route
    const nearestPoint = nearestPointOnLine(routeLine, currentPoint);
    const traveledDistance = nearestPoint.properties.location || 0;
    
    // Route length in km, convert to meters
    const routeLength = length(routeLine, { units: 'meters' });
    const remainingDistance = Math.max(0, routeLength - traveledDistance * 1000);
    const progress = Math.min(100, (traveledDistance * 1000 / routeLength) * 100);
    
    // Calculate remaining time
    let remainingDuration: number;
    if (averageSpeed && averageSpeed > 0) {
      // Use actual speed for more accurate ETA
      remainingDuration = remainingDistance / averageSpeed;
    } else {
      // Use proportional estimate
      remainingDuration = (remainingDistance / totalDistance) * totalDuration;
    }
    
    return {
      remainingDistance,
      remainingDuration,
      progress,
    };
  } catch (error) {
    console.error('Error calculating remaining route:', error);
    return {
      remainingDistance: totalDistance,
      remainingDuration: totalDuration,
      progress: 0,
    };
  }
}

// =============================================================================
// ETA CALCULATION
// =============================================================================

/**
 * Calculate estimated time of arrival
 * @param durationSeconds Duration in seconds
 * @param departureTime Optional departure time (defaults to now)
 * @returns Date object representing ETA
 */
export function calculateETA(
  durationSeconds: number,
  departureTime: Date = new Date()
): Date {
  return new Date(departureTime.getTime() + durationSeconds * 1000);
}

/**
 * Format ETA for display
 * @param eta Date object
 * @param language 'en' or 'bn'
 * @returns Formatted ETA string
 */
export function formatETA(eta: Date, language: 'en' | 'bn' = 'en'): string {
  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) {
    return language === 'bn' ? 'এখনই' : 'Now';
  }
  
  const hours = eta.getHours();
  const minutes = eta.getMinutes();
  const ampm = hours >= 12 ? (language === 'bn' ? 'PM' : 'PM') : (language === 'bn' ? 'AM' : 'AM');
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  
  if (language === 'bn') {
    return `${hour12}:${minuteStr} ${ampm} (${diffMins} মিনিট)`;
  }
  
  return `${hour12}:${minuteStr} ${ampm} (${diffMins} min)`;
}

// =============================================================================
// STATIC MAP & SHARING
// =============================================================================

/**
 * Generate a static map image URL with route
 * @param route Route geometry
 * @param options Image options
 * @returns Static map URL
 */
export function generateStaticMapUrl(
  route: GeoJSON.LineString,
  options: {
    width?: number;
    height?: number;
    style?: 'streets-v12' | 'satellite-v9' | 'outdoors-v12' | 'dark-v11';
    startMarker?: [number, number];
    endMarker?: [number, number];
  } = {}
): string {
  const {
    width = 600,
    height = 400,
    style = 'streets-v12',
    startMarker,
    endMarker,
  } = options;
  
  // Encode route as polyline
  const coords = route.coordinates;
  const pathString = coords.map(c => `[${c[0]},${c[1]}]`).join(',');
  
  let url = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/`;
  
  // Add route overlay
  const geoJsonOverlay = encodeURIComponent(JSON.stringify({
    type: 'Feature',
    geometry: route,
    properties: { stroke: '#3b82f6', 'stroke-width': 4 },
  }));
  url += `geojson(${geoJsonOverlay})`;
  
  // Add markers
  if (startMarker) {
    url += `,pin-s-a+22c55e(${startMarker[0]},${startMarker[1]})`;
  }
  if (endMarker) {
    url += `,pin-s-b+ef4444(${endMarker[0]},${endMarker[1]})`;
  }
  
  // Add auto-fit and dimensions
  url += `/auto/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
  
  return url;
}

/**
 * Generate shareable route link
 * @param routeId Route ID from database
 * @param shareToken Unique share token
 * @returns Shareable URL
 */
export function generateShareableRouteLink(
  routeId: string,
  shareToken: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  return `${baseUrl}/track/route/${routeId}?token=${shareToken}`;
}

/**
 * Get multiple route alternatives
 * @param start [longitude, latitude]
 * @param end [longitude, latitude]
 * @returns Promise<RouteResponse[]>
 */
export async function getMultipleRoutes(
  start: [number, number],
  end: [number, number]
): Promise<RouteResponse[]> {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      alternatives: 'true',
      steps: 'true',
      geometries: 'geojson',
      overview: 'full',
      annotations: 'duration,distance,speed',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes) {
      return data.routes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching multiple routes:', error);
    return [];
  }
}

// =============================================================================
// GEOCODING
// =============================================================================

export interface GeocodeResult {
  id: string;
  type: string;
  place_name: string;
  place_name_bn?: string;
  center: [number, number];
  address?: string;
  context?: Array<{
    id: string;
    text: string;
    text_bn?: string;
  }>;
}

/**
 * Reverse geocode: Get address from coordinates
 * @param lng Longitude
 * @param lat Latitude
 * @param language 'en' or 'bn'
 * @returns Promise<GeocodeResult | null>
 */
export async function reverseGeocode(
  lng: number,
  lat: number,
  language: 'en' | 'bn' = 'en'
): Promise<GeocodeResult | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      language: language,
      types: 'address,poi,place',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0];
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Search for places (geocoding)
 * @param query Search query
 * @param options Search options
 * @returns Promise<GeocodeResult[]>
 */
export async function searchPlaces(
  query: string,
  options: {
    proximity?: [number, number];
    bbox?: [number, number, number, number];
    types?: string;
    language?: 'en' | 'bn';
    limit?: number;
  } = {}
): Promise<GeocodeResult[]> {
  try {
    const {
      proximity,
      bbox,
      types = 'address,poi,place',
      language = 'en',
      limit = 10,
    } = options;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      types,
      language,
      limit: limit.toString(),
    });

    if (proximity) {
      params.append('proximity', `${proximity[0]},${proximity[1]}`);
    }

    if (bbox) {
      params.append('bbox', bbox.join(','));
    }

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    return data.features || [];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

// =============================================================================
// DISTANCE RINGS & SPATIAL QUERIES
// =============================================================================

/**
 * Create a circular polygon (distance ring)
 * @param center [longitude, latitude]
 * @param radiusKm Radius in kilometers
 * @param steps Number of points in circle (default 64 for smooth circle)
 * @returns GeoJSON Feature
 */
export function createDistanceRing(
  center: [number, number],
  radiusKm: number,
  steps: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const options = { steps, units: 'kilometers' as const };
  return circle(center, radiusKm, options);
}

/**
 * Find points within a radius
 * @param center [longitude, latitude]
 * @param points Array of [longitude, latitude]
 * @param radiusKm Radius in kilometers
 * @returns Array of points within radius with distances
 */
export function findPointsInRadius(
  center: [number, number],
  points: Array<{ id: string; coordinates: [number, number]; data?: any }>,
  radiusKm: number
): Array<{ id: string; coordinates: [number, number]; distance: number; data?: any }> {
  return points
    .map((point) => ({
      ...point,
      distance: calculateDistance(center, point.coordinates),
    }))
    .filter((point) => point.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Check if a point is inside a polygon
 * @param point [longitude, latitude]
 * @param polygonGeom GeoJSON Polygon
 * @returns boolean
 */
export function isPointInPolygon(
  pointCoords: [number, number],
  polygonGeom: GeoJSON.Polygon | GeoJSON.Feature<GeoJSON.Polygon>
): boolean {
  const pt = point(pointCoords);
  const poly = polygonGeom.type === 'Feature' ? polygonGeom : polygon(polygonGeom.coordinates);
  return booleanPointInPolygon(pt, poly);
}

// =============================================================================
// BEARING & ORIENTATION
// =============================================================================

/**
 * Calculate bearing from one point to another
 * @param from [longitude, latitude]
 * @param to [longitude, latitude]
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  from: [number, number],
  to: [number, number]
): number {
  const bearingValue = bearing(from, to);
  return bearingValue < 0 ? bearingValue + 360 : bearingValue;
}

/**
 * Get destination point given start, distance, and bearing
 * @param start [longitude, latitude]
 * @param distanceKm Distance in kilometers
 * @param bearingDeg Bearing in degrees
 * @returns [longitude, latitude]
 */
export function getDestination(
  start: [number, number],
  distanceKm: number,
  bearingDeg: number
): [number, number] {
  const dest = destination(start, distanceKm, bearingDeg, { units: 'kilometers' });
  return dest.geometry.coordinates as [number, number];
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format distance for display
 * @param meters Distance in meters
 * @param language 'en' or 'bn'
 * @returns Formatted distance string
 */
export function formatDistance(meters: number, language: 'en' | 'bn' = 'en'): string {
  if (meters < 1000) {
    return language === 'bn' 
      ? `${Math.round(meters)} মিটার`
      : `${Math.round(meters)} m`;
  }
  
  const km = (meters / 1000).toFixed(1);
  return language === 'bn'
    ? `${km} কিলোমিটার`
    : `${km} km`;
}

/**
 * Format duration for display
 * @param seconds Duration in seconds
 * @param language 'en' or 'bn'
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, language: 'en' | 'bn' = 'en'): string {
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return language === 'bn'
      ? `${minutes} মিনিট`
      : `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (language === 'bn') {
    return remainingMinutes > 0
      ? `${hours} ঘণ্টা ${remainingMinutes} মিনিট`
      : `${hours} ঘণ্টা`;
  }
  
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Translate maneuver types to Bengali
 * @param type Maneuver type
 * @returns Bengali translation
 */
export function translateManeuver(type: string): string {
  const translations: Record<string, string> = {
    turn: 'মোড় নিন',
    'new name': 'নতুন রাস্তা',
    depart: 'যাত্রা শুরু করুন',
    arrive: 'গন্তব্যে পৌঁছেছেন',
    merge: 'মিশে যান',
    'on ramp': 'প্রবেশ করুন',
    'off ramp': 'বের হন',
    fork: 'ভাগ হয়েছে',
    'end of road': 'রাস্তার শেষ',
    continue: 'সোজা যান',
    roundabout: 'রাউন্ডঅ্যাবাউট',
    rotary: 'রোটারি',
    'roundabout turn': 'রাউন্ডঅ্যাবাউট থেকে মোড়',
    notification: 'বিজ্ঞপ্তি',
    'exit roundabout': 'রাউন্ডঅ্যাবাউট থেকে বের হন',
    'exit rotary': 'রোটারি থেকে বের হন',
  };
  
  return translations[type] || type;
}

// =============================================================================
// CACHING
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data or fetch new
 * @param key Cache key
 * @param fetcher Function to fetch data
 * @param duration Cache duration in milliseconds
 * @returns Cached or fresh data
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = CACHE_DURATION
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}

/**
 * Clear cache
 * @param key Optional specific key to clear
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

