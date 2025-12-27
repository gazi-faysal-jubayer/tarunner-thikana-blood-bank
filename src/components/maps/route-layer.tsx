/**
 * Route Visualization Component
 * Display routes with turn-by-turn directions
 */

'use client';

import { useState, useEffect } from 'react';
import { Source, Layer, Marker } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import { Navigation, MapPin, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDirections, getMultipleRoutes, formatDistance, formatDuration, translateManeuver } from '@/lib/map-utils';
import type { RouteData, RouteStep } from './types';

interface RouteLayerProps {
  start: [number, number];
  end: [number, number];
  visible?: boolean;
  color?: string;
  showAlternatives?: boolean;
  onRouteCalculated?: (route: RouteData) => void;
}

export function RouteLayer({
  start,
  end,
  visible = true,
  color = '#3b82f6',
  showAlternatives = false,
  onRouteCalculated,
}: RouteLayerProps) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setRoutes([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        if (showAlternatives) {
          const multipleRoutes = await getMultipleRoutes(start, end);
          const routeData: RouteData[] = multipleRoutes.map((route, index) => ({
            id: `route-${index}`,
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            steps: route.legs[0]?.steps || [],
            isAlternative: index > 0,
          }));
          setRoutes(routeData);
          if (routeData.length > 0 && onRouteCalculated) {
            onRouteCalculated(routeData[0]);
          }
        } else {
          const route = await getDirections(start, end, { steps: true });
          if (route) {
            const routeData: RouteData = {
              id: 'route-0',
              geometry: route.geometry,
              distance: route.distance,
              duration: route.duration,
              steps: route.legs[0]?.steps || [],
              isAlternative: false,
            };
            setRoutes([routeData]);
            if (onRouteCalculated) {
              onRouteCalculated(routeData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setRoutes([]);
      }
    };

    fetchRoute();
  }, [start, end, visible, showAlternatives, onRouteCalculated]);

  if (!visible || routes.length === 0) {
    return null;
  }

  const selectedRoute = routes[selectedRouteIndex];

  // Main route layer (without source as it's defined in Source component)
  const mainRouteLayer: any = {
    id: 'route-main',
    type: 'line',
    paint: {
      'line-color': color,
      'line-width': 6,
      'line-opacity': 0.8,
    },
  };

  // Route casing (outline)
  const routeCasingLayer: any = {
    id: 'route-casing',
    type: 'line',
    paint: {
      'line-color': '#ffffff',
      'line-width': 8,
      'line-opacity': 0.6,
    },
  };

  // Alternative routes layer
  const alternativeRouteLayer: any = {
    id: 'route-alternative',
    type: 'line',
    paint: {
      'line-color': '#94a3b8',
      'line-width': 4,
      'line-opacity': 0.5,
      'line-dasharray': [2, 2],
    },
  };

  return (
    <>
      {/* Alternative routes */}
      {routes.map((route, index) => {
        if (index === selectedRouteIndex) return null;
        
        const routeGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: route.geometry,
              properties: {},
            },
          ],
        };

        return (
          <Source
            key={route.id}
            id={route.id}
            type="geojson"
            data={routeGeoJSON}
          >
            <Layer {...alternativeRouteLayer} id={`${route.id}-alt`} />
          </Source>
        );
      })}

      {/* Selected route */}
      {selectedRoute && (
        <>
          <Source
            id="route-selected"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: selectedRoute.geometry,
                  properties: {},
                },
              ],
            }}
          >
            <Layer {...routeCasingLayer} />
            <Layer {...mainRouteLayer} />
          </Source>

          {/* Start marker */}
          <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
            <div className="bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </Marker>

          {/* End marker */}
          <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
            <div className="bg-red-500 rounded-full p-2 shadow-lg border-2 border-white">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </Marker>
        </>
      )}
    </>
  );
}

// =============================================================================
// Turn-by-Turn Directions Panel
// =============================================================================

interface DirectionsPanelProps {
  route: RouteData | null;
  routes?: RouteData[];
  onRouteSelect?: (index: number) => void;
  selectedIndex?: number;
  language?: 'en' | 'bn';
}

export function DirectionsPanel({
  route,
  routes = [],
  onRouteSelect,
  selectedIndex = 0,
  language = 'bn',
}: DirectionsPanelProps) {
  if (!route) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Navigation className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>রুট খুঁজতে মানচিত্রে দুটি পয়েন্ট নির্বাচন করুন</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          নির্দেশনা
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {/* Route Summary */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">
                {formatDuration(route.duration, language)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">
                {formatDistance(route.distance, language)}
              </span>
            </div>
          </div>

          {/* Route alternatives */}
          {routes.length > 1 && (
            <div className="flex gap-2 mt-3">
              {routes.map((r, index) => (
                <button
                  key={r.id}
                  onClick={() => onRouteSelect?.(index)}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    index === selectedIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">
                    রুট {index + 1}
                  </div>
                  <div className="text-xs opacity-80">
                    {formatDuration(r.duration, language)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Turn-by-turn steps */}
        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="p-4 space-y-3">
            {route.steps?.map((step, index) => (
              <RouteStepItem
                key={index}
                step={step}
                index={index}
                isLast={index === route.steps!.length - 1}
                language={language}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Route Step Item Component
// =============================================================================

interface RouteStepItemProps {
  step: RouteStep;
  index: number;
  isLast: boolean;
  language: 'en' | 'bn';
}

function RouteStepItem({ step, index, isLast, language }: RouteStepItemProps) {
  const getManeuverIcon = (type: string) => {
    if (type.includes('arrive')) return '🏁';
    if (type.includes('depart')) return '🚗';
    if (type.includes('turn') || type.includes('fork')) return '↪️';
    if (type.includes('merge')) return '🔀';
    if (type.includes('roundabout') || type.includes('rotary')) return '⭕';
    return '➡️';
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">
          {getManeuverIcon(step.maneuver.type)}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>

      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">
            {language === 'bn' 
              ? translateManeuver(step.maneuver.type)
              : step.instruction}
            {step.name && ` - ${step.name}`}
          </p>
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {formatDistance(step.distance, language)}
          </Badge>
        </div>
        
        {step.maneuver.modifier && (
          <p className="text-xs text-muted-foreground mt-1">
            {step.maneuver.modifier}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Route Navigation Control (for donor tracking)
// =============================================================================

interface RouteNavigationProps {
  route: RouteData;
  currentLocation?: [number, number];
  onStartNavigation?: () => void;
  onStopNavigation?: () => void;
  isNavigating?: boolean;
}

export function RouteNavigation({
  route,
  currentLocation,
  onStartNavigation,
  onStopNavigation,
  isNavigating = false,
}: RouteNavigationProps) {
  const [nextStep, setNextStep] = useState<RouteStep | null>(null);

  useEffect(() => {
    if (!isNavigating || !currentLocation || !route.steps) {
      setNextStep(null);
      return;
    }

    // Find next step based on current location
    // (simplified - in production would calculate closest point on route)
    const firstStep = route.steps[0];
    setNextStep(firstStep);
  }, [isNavigating, currentLocation, route]);

  if (!isNavigating) {
    return (
      <Card className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <CardContent className="p-4">
          <Button onClick={onStartNavigation} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            নেভিগেশন শুরু করুন
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 min-w-[300px]">
      <CardContent className="p-4">
        {nextStep ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <Badge className="text-xs">
                {formatDistance(nextStep.distance, 'bn')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onStopNavigation}
              >
                বন্ধ করুন
              </Button>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-3xl">➡️</div>
              <div>
                <p className="font-semibold">
                  {translateManeuver(nextStep.maneuver.type)}
                </p>
                {nextStep.name && (
                  <p className="text-sm text-muted-foreground">
                    {nextStep.name}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm">রুট খুঁজছি...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

