/**
 * Distance Ring Component
 * Visualize distance circles for donor discovery
 */

'use client';

import { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { CircleLayer, FillLayer } from 'react-map-gl';
import { createDistanceRing } from '@/lib/map-utils';
import type { DistanceRing } from './types';

interface DistanceRingProps {
  rings: DistanceRing[];
  visible?: boolean;
}

export function DistanceRings({ rings, visible = true }: DistanceRingProps) {
  const [ringFeatures, setRingFeatures] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  useEffect(() => {
    if (!visible || rings.length === 0) {
      setRingFeatures({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features = rings.map((ring) => {
      const feature = createDistanceRing(ring.center, ring.radius);
      return {
        ...feature,
        id: ring.id,
        properties: {
          ...feature.properties,
          id: ring.id,
          color: ring.color,
          radius: ring.radius,
          label: ring.label,
        },
      };
    });

    setRingFeatures({
      type: 'FeatureCollection',
      features,
    });
  }, [rings, visible]);

  if (!visible || rings.length === 0) {
    return null;
  }

  // Fill layer for the ring area
  const fillLayer: FillLayer = {
    id: 'distance-rings-fill',
    type: 'fill',
    source: 'distance-rings',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.1,
    },
  };

  // Outline layer for the ring border
  const outlineLayer: any = {
    id: 'distance-rings-outline',
    type: 'line',
    source: 'distance-rings',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 2,
      'line-dasharray': [2, 2],
      'line-opacity': 0.6,
    },
  };

  return (
    <Source id="distance-rings" type="geojson" data={ringFeatures}>
      <Layer {...fillLayer} />
      <Layer {...outlineLayer} />
    </Source>
  );
}

// =============================================================================
// Distance Ring Controls Component
// =============================================================================

interface DistanceRingControlsProps {
  center: [number, number];
  onChange: (rings: DistanceRing[]) => void;
  enabled?: boolean;
}

const PRESET_RADII = [
  { radius: 5, label: '5 কিমি', color: '#10b981' }, // green
  { radius: 10, label: '10 কিমি', color: '#f59e0b' }, // orange
  { radius: 20, label: '20 কিমি', color: '#ef4444' }, // red
];

export function DistanceRingControls({
  center,
  onChange,
  enabled = false,
}: DistanceRingControlsProps) {
  const [activeRadii, setActiveRadii] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) {
      setActiveRadii([]);
      onChange([]);
      return;
    }

    const rings: DistanceRing[] = activeRadii.map((radius) => {
      const preset = PRESET_RADII.find((p) => p.radius === radius);
      return {
        id: `ring-${radius}`,
        center,
        radius,
        color: preset?.color || '#3b82f6',
        label: preset?.label || `${radius} km`,
      };
    });

    onChange(rings);
  }, [activeRadii, center, enabled, onChange]);

  const toggleRadius = (radius: number) => {
    setActiveRadii((prev) => {
      if (prev.includes(radius)) {
        return prev.filter((r) => r !== radius);
      }
      return [...prev, radius].sort((a, b) => a - b);
    });
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold mb-2">দূরত্ব রিং</p>
      <div className="space-y-2">
        {PRESET_RADII.map(({ radius, label, color }) => (
          <label
            key={radius}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          >
            <input
              type="checkbox"
              checked={activeRadii.includes(radius)}
              onChange={() => toggleRadius(radius)}
              className="rounded"
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Utility: Filter markers by distance rings
// =============================================================================

export function filterMarkersByRings<T extends { latitude: number; longitude: number }>(
  markers: T[],
  center: [number, number],
  rings: DistanceRing[]
): Map<string, T[]> {
  const result = new Map<string, T[]>();

  if (rings.length === 0) {
    return result;
  }

  // Sort rings by radius (smallest first)
  const sortedRings = [...rings].sort((a, b) => a.radius - b.radius);

  // Initialize map for each ring
  sortedRings.forEach((ring) => {
    result.set(ring.id, []);
  });

  // Add "outside" category for markers beyond all rings
  result.set('outside', []);

  // Calculate distance from center for each marker
  markers.forEach((marker) => {
    const point: [number, number] = [marker.longitude, marker.latitude];
    
    // Calculate straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = ((center[1] - marker.latitude) * Math.PI) / 180;
    const dLon = ((center[0] - marker.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((marker.latitude * Math.PI) / 180) *
        Math.cos((center[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Find which ring this marker belongs to
    let assigned = false;
    for (const ring of sortedRings) {
      if (distance <= ring.radius) {
        result.get(ring.id)?.push(marker);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      result.get('outside')?.push(marker);
    }
  });

  return result;
}

// =============================================================================
// Distance Ring Statistics Component
// =============================================================================

interface DistanceRingStatsProps {
  markersByRing: Map<string, any[]>;
  rings: DistanceRing[];
}

export function DistanceRingStats({
  markersByRing,
  rings,
}: DistanceRingStatsProps) {
  if (rings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h3 className="font-semibold mb-3">দূরত্ব অনুসারে পরিসংখ্যান</h3>
      <div className="space-y-2">
        {rings.map((ring) => {
          const count = markersByRing.get(ring.id)?.length || 0;
          return (
            <div key={ring.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ring.color }}
                />
                <span className="text-sm">{ring.label}</span>
              </div>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          );
        })}
        <div className="border-t pt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">মোট</span>
          <span className="text-sm font-semibold">
            {Array.from(markersByRing.values()).reduce(
              (sum, arr) => sum + arr.length,
              0
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

