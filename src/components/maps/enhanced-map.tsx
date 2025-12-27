/**
 * Enhanced Map Component
 * Main 3D map with buildings, terrain, and all advanced features
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, ScaleControl } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { MapPin, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RouteLayer } from './route-layer';
import { DistanceRings } from './distance-ring';
import { LocationTracker } from './location-tracker';
import type { MapMarker, MapViewState, MapStyle, MapControls, DistanceRing } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface EnhancedMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showControls?: boolean;
  selectedMarker?: string | null;
  enable3D?: boolean;
  enableLocationTracking?: boolean;
  routeStart?: [number, number];
  routeEnd?: [number, number];
  distanceRings?: DistanceRing[];
  style?: MapStyle;
}

const mapStyles: Record<MapStyle, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

// Mock markers for demonstration
const defaultMarkers: MapMarker[] = [
  {
    id: '1',
    type: 'request',
    latitude: 23.8103,
    longitude: 90.4125,
    bloodGroup: 'A+',
    urgency: 'critical',
    title: 'ঢাকা মেডিকেল কলেজ',
    subtitle: '২ ব্যাগ প্রয়োজন',
  },
  {
    id: '2',
    type: 'request',
    latitude: 23.78,
    longitude: 90.42,
    bloodGroup: 'O-',
    urgency: 'urgent',
    title: 'স্কয়ার হাসপাতাল',
    subtitle: '১ ব্যাগ প্রয়োজন',
  },
  {
    id: '3',
    type: 'request',
    latitude: 23.75,
    longitude: 90.38,
    bloodGroup: 'B+',
    urgency: 'normal',
    title: 'ইউনাইটেড হাসপাতাল',
    subtitle: '৩ ব্যাগ প্রয়োজন',
  },
];

export function EnhancedMap({
  markers = defaultMarkers,
  center = { lat: 23.8103, lng: 90.4125 },
  zoom = 12,
  height = '600px',
  onMarkerClick,
  onMapClick,
  showControls = true,
  selectedMarker,
  enable3D = false,
  enableLocationTracking = false,
  routeStart,
  routeEnd,
  distanceRings = [],
  style = 'streets',
}: EnhancedMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: center.lng,
    latitude: center.lat,
    zoom,
    bearing: 0,
    pitch: enable3D ? 60 : 0,
  });
  const [is3DEnabled, setIs3DEnabled] = useState(enable3D);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(style);

  // Get Mapbox token from environment
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Initialize 3D buildings and terrain when map loads
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Add 3D buildings layer
    if (!map.getLayer('3d-buildings')) {
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    }

    // Add terrain
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });
    }

    // Set terrain if 3D is enabled
    if (is3DEnabled) {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }
  }, [is3DEnabled]);

  // Toggle 3D mode
  const toggle3D = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const new3DState = !is3DEnabled;
    setIs3DEnabled(new3DState);

    // Animate pitch change
    map.easeTo({
      pitch: new3DState ? 60 : 0,
      duration: 1000,
    });

    // Toggle terrain
    if (new3DState) {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    } else {
      map.setTerrain(null);
    }

    // Toggle 3D buildings visibility
    if (map.getLayer('3d-buildings')) {
      map.setLayoutProperty(
        '3d-buildings',
        'visibility',
        new3DState ? 'visible' : 'none'
      );
    }
  }, [is3DEnabled]);

  // Change map style
  const changeStyle = useCallback((newStyle: MapStyle) => {
    setCurrentStyle(newStyle);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (event: any) => {
      if (onMapClick) {
        const { lngLat } = event;
        onMapClick(lngLat.lat, lngLat.lng);
      }
    },
    [onMapClick]
  );

  // Get marker color based on type and urgency
  const getMarkerColor = (marker: MapMarker) => {
    if (marker.type === 'request') {
      switch (marker.urgency) {
        case 'critical':
          return 'bg-red-600';
        case 'urgent':
          return 'bg-orange-500';
        default:
          return 'bg-yellow-500';
      }
    }
    if (marker.type === 'donor') return 'bg-blue-500';
    if (marker.type === 'volunteer') return 'bg-purple-500';
    if (marker.type === 'hospital') return 'bg-green-500';
    if (marker.type === 'user') return 'bg-blue-600';
    return 'bg-gray-500';
  };

  // Get marker icon
  const getMarkerIcon = (marker: MapMarker) => {
    if (marker.type === 'request' || marker.type === 'donor') return Droplet;
    return MapPin;
  };

  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        mapStyle={mapStyles[currentStyle]}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        maxPitch={85}
        minZoom={8}
        maxZoom={20}
      >
        {/* Map controls */}
        {showControls && (
          <>
            <NavigationControl position="bottom-right" showCompass visualizePitch />
            <GeolocateControl
              position="bottom-right"
              trackUserLocation={enableLocationTracking}
              showUserHeading
            />
            <ScaleControl position="bottom-left" />
          </>
        )}

        {/* Distance rings */}
        {distanceRings.length > 0 && (
          <DistanceRings rings={distanceRings} visible={true} />
        )}

        {/* Route layer */}
        {routeStart && routeEnd && (
          <RouteLayer
            start={routeStart}
            end={routeEnd}
            visible={true}
            showAlternatives={false}
          />
        )}

        {/* Location tracking */}
        {enableLocationTracking && (
          <LocationTracker
            enabled={true}
            showAccuracy={true}
            autoCenter={false}
          />
        )}

        {/* Markers */}
        {markers.map((marker) => {
          const Icon = getMarkerIcon(marker);
          const isSelected = selectedMarker === marker.id;
          const isHovered = hoveredMarker === marker.id;

          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="bottom"
            >
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerClick?.(marker);
                }}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
              >
                <div
                  className={cn(
                    'relative flex flex-col items-center transition-transform',
                    isSelected && 'scale-125'
                  )}
                >
                  {/* Pulse animation for critical */}
                  {marker.urgency === 'critical' && (
                    <div className="absolute -inset-2 animate-ping rounded-full bg-red-600/30" />
                  )}

                  {/* Marker icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white',
                      getMarkerColor(marker),
                      isSelected && 'ring-2 ring-blood-600 ring-offset-2'
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Blood group label */}
                  {marker.bloodGroup && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow">
                      {marker.bloodGroup}
                    </div>
                  )}

                  {/* Tooltip */}
                  {(isHovered || isSelected) && (
                    <div className="absolute bottom-full mb-3 bg-white rounded-lg shadow-xl p-3 min-w-[180px] text-left z-50 border">
                      <p className="font-semibold text-sm">{marker.title}</p>
                      {marker.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {marker.subtitle}
                        </p>
                      )}
                      {marker.bloodGroup && (
                        <Badge className="mt-2" variant="default">
                          {marker.bloodGroup}
                        </Badge>
                      )}
                      {marker.urgency && (
                        <Badge
                          className={cn(
                            'mt-2 ml-1',
                            marker.urgency === 'critical' && 'bg-red-600',
                            marker.urgency === 'urgent' && 'bg-orange-500',
                            marker.urgency === 'normal' && 'bg-yellow-500'
                          )}
                        >
                          {marker.urgency === 'critical' && 'জরুরি'}
                          {marker.urgency === 'urgent' && 'দ্রুত'}
                          {marker.urgency === 'normal' && 'সাধারণ'}
                        </Badge>
                      )}
                      {marker.distance !== undefined && (
                        <p className="text-xs text-muted-foreground mt-2">
                          দূরত্ব: {marker.distance.toFixed(1)} কিমি
                        </p>
                      )}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b" />
                    </div>
                  )}
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Map label */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-white/90 backdrop-blur">
          <MapPin className="h-3 w-3 mr-1" />
          ঢাকা, বাংলাদেশ
        </Badge>
      </div>

      {/* Powered by Mapbox badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="bg-white/90 backdrop-blur">
          Powered by Mapbox {is3DEnabled && '3D'}
        </Badge>
      </div>

      {/* 3D Toggle Button */}
      <div className="absolute top-16 right-4 z-10">
        <button
          onClick={toggle3D}
          className={cn(
            'px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors',
            is3DEnabled
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          {is3DEnabled ? '3D ✓' : '2D'}
        </button>
      </div>

      {/* Style switcher */}
      <div className="absolute top-28 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
        <select
          value={currentStyle}
          onChange={(e) => changeStyle(e.target.value as MapStyle)}
          className="text-sm border-none outline-none cursor-pointer"
        >
          <option value="streets">Streets</option>
          <option value="satellite">Satellite</option>
          <option value="outdoors">Outdoors</option>
          <option value="navigation">Navigation</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
}

