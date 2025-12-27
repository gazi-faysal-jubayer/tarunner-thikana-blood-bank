/**
 * Map Utilities - Distance Calculations, Routes, Geocoding
 * Comprehensive helper functions for Mapbox integration
 */

// @ts-ignore - Turf types issue with Next.js
import * as turf from '@turf/turf';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

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
  return turf.distance(from, to, { units: 'kilometers' });
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
  return turf.circle(center, radiusKm, options);
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
 * @param polygon GeoJSON Polygon
 * @returns boolean
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: GeoJSON.Polygon | GeoJSON.Feature<GeoJSON.Polygon>
): boolean {
  const pt = turf.point(point);
  const poly = polygon.type === 'Feature' ? polygon : turf.polygon(polygon.coordinates);
  return turf.booleanPointInPolygon(pt, poly);
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
  const bearing = turf.bearing(from, to);
  return bearing < 0 ? bearing + 360 : bearing;
}

/**
 * Get destination point given start, distance, and bearing
 * @param start [longitude, latitude]
 * @param distance Distance in kilometers
 * @param bearing Bearing in degrees
 * @returns [longitude, latitude]
 */
export function getDestination(
  start: [number, number],
  distance: number,
  bearing: number
): [number, number] {
  const destination = turf.destination(start, distance, bearing, { units: 'kilometers' });
  return destination.geometry.coordinates as [number, number];
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

