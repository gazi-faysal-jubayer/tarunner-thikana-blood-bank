/**
 * Location Tracking Service
 * Real-time GPS tracking with accuracy monitoring and bearing calculation
 */

import { calculateBearing } from '@/lib/map-utils';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

type LocationCallback = (location: LocationData) => void;
type ErrorCallback = (error: LocationError) => void;

export class LocationTracker {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private lastLocation: LocationData | null = null;
  private callbacks: LocationCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private options: PositionOptions;

  constructor(options: PositionOptions = {}) {
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      ...options,
    };
  }

  /**
   * Start tracking user location
   * @param callback Function to call on location update
   * @param errorCallback Function to call on error
   * @returns boolean indicating success
   */
  startTracking(
    callback: LocationCallback,
    errorCallback?: ErrorCallback
  ): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }

    if (this.isTracking) {
      console.warn('Location tracking is already active');
      return true;
    }

    this.callbacks.push(callback);
    if (errorCallback) {
      this.errorCallbacks.push(errorCallback);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      this.options
    );

    this.isTracking = true;
    return true;
  }

  /**
   * Stop tracking user location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Get current position once (no continuous tracking)
   * @returns Promise<LocationData>
   */
  getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = this.positionToLocationData(position);
          resolve(locationData);
        },
        (error) => {
          reject(this.geolocationErrorToLocationError(error));
        },
        this.options
      );
    });
  }

  /**
   * Check if tracking is active
   */
  isActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get last known location
   */
  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  /**
   * Calculate bearing from last location to current
   * @param currentLocation Current location
   * @returns Bearing in degrees or null
   */
  calculateMovementBearing(currentLocation: LocationData): number | null {
    if (!this.lastLocation) {
      return null;
    }

    return calculateBearing(
      [this.lastLocation.longitude, this.lastLocation.latitude],
      [currentLocation.longitude, currentLocation.latitude]
    );
  }

  /**
   * Calculate speed between two locations
   * @param from Previous location
   * @param to Current location
   * @returns Speed in km/h
   */
  calculateSpeed(from: LocationData, to: LocationData): number {
    const timeDiff = (to.timestamp - from.timestamp) / 1000; // seconds
    if (timeDiff === 0) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km

    return (distance / timeDiff) * 3600; // km/h
  }

  /**
   * Handle position update
   */
  private handlePosition(position: GeolocationPosition): void {
    const locationData = this.positionToLocationData(position);
    
    // Calculate bearing if we have a previous location
    if (this.lastLocation && !locationData.heading) {
      const bearing = this.calculateMovementBearing(locationData);
      if (bearing !== null) {
        locationData.heading = bearing;
      }
    }

    // Calculate speed if not provided and we have previous location
    if (this.lastLocation && !locationData.speed) {
      locationData.speed = this.calculateSpeed(this.lastLocation, locationData);
    }

    this.lastLocation = locationData;

    // Call all registered callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(locationData);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  /**
   * Handle geolocation error
   */
  private handleError(error: GeolocationPositionError): void {
    const locationError = this.geolocationErrorToLocationError(error);

    // Call all registered error callbacks
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(locationError);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }

  /**
   * Convert GeolocationPosition to LocationData
   */
  private positionToLocationData(
    position: GeolocationPosition
  ): LocationData {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };
  }

  /**
   * Convert GeolocationPositionError to LocationError
   */
  private geolocationErrorToLocationError(
    error: GeolocationPositionError
  ): LocationError {
    const messages: Record<number, string> = {
      1: 'Permission denied - Please allow location access',
      2: 'Position unavailable - Cannot determine your location',
      3: 'Timeout - Location request timed out',
    };

    return {
      code: error.code,
      message: messages[error.code] || 'Unknown error occurred',
    };
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get accuracy description
   */
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy < 10) return 'excellent';
    if (accuracy < 50) return 'good';
    if (accuracy < 100) return 'fair';
    return 'poor';
  }

  /**
   * Check if location has sufficient accuracy
   */
  static isSufficientAccuracy(
    accuracy: number,
    threshold: number = 100
  ): boolean {
    return accuracy <= threshold;
  }
}

// =============================================================================
// LOCATION STORAGE (for offline/background tracking)
// =============================================================================

const LOCATION_HISTORY_KEY = 'location_history';
const MAX_HISTORY_SIZE = 100;

export interface StoredLocation extends LocationData {
  id: string;
}

/**
 * Save location to local storage
 */
export function saveLocationToHistory(location: LocationData): void {
  try {
    const history = getLocationHistory();
    const stored: StoredLocation = {
      ...location,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    history.unshift(stored);

    // Keep only last MAX_HISTORY_SIZE locations
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }

    localStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving location to history:', error);
  }
}

/**
 * Get location history from local storage
 */
export function getLocationHistory(): StoredLocation[] {
  try {
    const stored = localStorage.getItem(LOCATION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting location history:', error);
    return [];
  }
}

/**
 * Clear location history
 */
export function clearLocationHistory(): void {
  try {
    localStorage.removeItem(LOCATION_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing location history:', error);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let trackerInstance: LocationTracker | null = null;

/**
 * Get singleton location tracker instance
 */
export function getLocationTracker(): LocationTracker {
  if (!trackerInstance) {
    trackerInstance = new LocationTracker();
  }
  return trackerInstance;
}

/**
 * Clean up tracker instance
 */
export function cleanupLocationTracker(): void {
  if (trackerInstance) {
    trackerInstance.stopTracking();
    trackerInstance = null;
  }
}

// =============================================================================
// REACT HOOK (for easy integration)
// =============================================================================

export interface UseLocationOptions extends PositionOptions {
  enabled?: boolean;
  onError?: ErrorCallback;
}

/**
 * React hook for location tracking
 * Usage: const { location, error, isTracking } = useLocation();
 */
export function useLocationTracking(options: UseLocationOptions = {}) {
  const { enabled = true, onError, ...positionOptions } = options;
  
  // This would be implemented in a separate hook file
  // Kept here for reference
  return {
    location: null as LocationData | null,
    error: null as LocationError | null,
    isTracking: false,
    startTracking: () => {},
    stopTracking: () => {},
    getCurrentPosition: async () => null as LocationData | null,
  };
}


