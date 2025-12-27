/**
 * Location Tracker Component
 * Visual real-time location tracking marker
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Marker, Source, Layer } from 'react-map-gl';
import type { CircleLayer } from 'react-map-gl';
import { Navigation2 } from 'lucide-react';
import { getLocationTracker } from '@/lib/services/location';
import type { LocationData } from '@/lib/services/location';

interface LocationTrackerProps {
  enabled?: boolean;
  onLocationUpdate?: (location: LocationData) => void;
  showAccuracy?: boolean;
  autoCenter?: boolean;
  onAutoCenter?: (lng: number, lat: number) => void;
}

export function LocationTracker({
  enabled = false,
  onLocationUpdate,
  showAccuracy = true,
  autoCenter = false,
  onAutoCenter,
}: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationUpdate = useCallback((loc: LocationData) => {
    setLocation(loc);
    setError(null);
    
    if (onLocationUpdate) {
      onLocationUpdate(loc);
    }

    if (autoCenter && onAutoCenter) {
      onAutoCenter(loc.longitude, loc.latitude);
    }
  }, [onLocationUpdate, autoCenter, onAutoCenter]);

  const handleLocationError = useCallback((err: any) => {
    setError(err.message);
    console.error('Location tracking error:', err);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLocation(null);
      setError(null);
      return;
    }

    const tracker = getLocationTracker();
    
    tracker.startTracking(handleLocationUpdate, handleLocationError);

    return () => {
      tracker.stopTracking();
    };
  }, [enabled, handleLocationUpdate, handleLocationError]);

  if (!enabled || !location) {
    return null;
  }

  // Accuracy circle layer
  const accuracyLayer: any = {
    id: 'location-accuracy',
    type: 'circle',
    source: 'location-accuracy',
    paint: {
      'circle-radius': {
        stops: [
          [0, 0],
          [20, location.accuracy],
        ],
        base: 2,
      },
      'circle-color': '#3b82f6',
      'circle-opacity': 0.1,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#3b82f6',
      'circle-stroke-opacity': 0.3,
    },
  };

  // Create GeoJSON for accuracy circle
  const accuracyCircle: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          accuracy: location.accuracy,
        },
      },
    ],
  };

  return (
    <>
      {/* Accuracy circle */}
      {showAccuracy && location.accuracy && (
        <Source id="location-accuracy" type="geojson" data={accuracyCircle}>
          <Layer {...accuracyLayer} />
        </Source>
      )}

      {/* User location marker */}
      <Marker
        longitude={location.longitude}
        latitude={location.latitude}
        anchor="center"
      >
        <div className="relative">
          {/* Pulsing outer ring */}
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" style={{ width: '40px', height: '40px', marginLeft: '-8px', marginTop: '-8px' }} />
          
          {/* Steady outer ring */}
          <div className="absolute inset-0 rounded-full bg-blue-500/30" style={{ width: '40px', height: '40px', marginLeft: '-8px', marginTop: '-8px' }} />
          
          {/* Inner dot */}
          <div className="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            {location.heading !== null && (
              <Navigation2 
                className="h-4 w-4 text-white"
                style={{ 
                  transform: `rotate(${location.heading}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              />
            )}
          </div>

          {/* Accuracy badge */}
          {showAccuracy && location.accuracy && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-2 py-0.5 rounded text-xs shadow">
                ±{Math.round(location.accuracy)}m
              </div>
            </div>
          )}
        </div>
      </Marker>

      {/* Error notification */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow">
            {error}
          </div>
        </div>
      )}
    </>
  );
}

