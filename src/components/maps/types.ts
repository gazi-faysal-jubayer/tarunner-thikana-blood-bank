/**
 * Map Component Types
 * Shared TypeScript types for map components
 */

export interface MapMarker {
  id: string;
  type: 'request' | 'donor' | 'volunteer' | 'hospital' | 'user';
  latitude: number;
  longitude: number;
  bloodGroup?: string;
  urgency?: 'critical' | 'urgent' | 'normal';
  status?: string;
  title: string;
  subtitle?: string;
  distance?: number; // Distance from reference point in km
  data?: any; // Additional custom data
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export type MapStyle = 
  | 'streets'
  | 'satellite'
  | 'outdoors'
  | 'navigation'
  | 'dark';

export interface MapControls {
  show3D: boolean;
  showDistanceRings: boolean;
  showRoute: boolean;
  showTraffic: boolean;
  distanceRingRadii: number[]; // in km
  selectedStyle: MapStyle;
}

export interface RouteData {
  id: string;
  geometry: GeoJSON.LineString;
  distance: number; // meters
  duration: number; // seconds
  steps?: RouteStep[];
  isAlternative?: boolean;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface DistanceRing {
  id: string;
  center: [number, number];
  radius: number; // km
  color: string;
  label: string;
}

export interface MapInteractionHandlers {
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lng: number, lat: number) => void;
  onMapMove?: (viewState: MapViewState) => void;
  onMarkerHover?: (marker: MapMarker | null) => void;
}

