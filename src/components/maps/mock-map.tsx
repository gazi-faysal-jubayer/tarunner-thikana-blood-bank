"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, ScaleControl } from "react-map-gl";
import { MapPin, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapMarker {
  id: string;
  type: "request" | "donor" | "volunteer" | "hospital";
  latitude: number;
  longitude: number;
  bloodGroup?: string;
  urgency?: "critical" | "urgent" | "normal";
  status?: string;
  title: string;
  subtitle?: string;
}

interface MockMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showControls?: boolean;
  selectedMarker?: string | null;
}

// Mock markers for demonstration
const defaultMarkers: MapMarker[] = [
  {
    id: "1",
    type: "request",
    latitude: 23.8103,
    longitude: 90.4125,
    bloodGroup: "A+",
    urgency: "critical",
    title: "ঢাকা মেডিকেল কলেজ",
    subtitle: "২ ব্যাগ প্রয়োজন",
  },
  {
    id: "2",
    type: "request",
    latitude: 23.78,
    longitude: 90.42,
    bloodGroup: "O-",
    urgency: "urgent",
    title: "স্কয়ার হাসপাতাল",
    subtitle: "১ ব্যাগ প্রয়োজন",
  },
  {
    id: "3",
    type: "request",
    latitude: 23.75,
    longitude: 90.38,
    bloodGroup: "B+",
    urgency: "normal",
    title: "ইউনাইটেড হাসপাতাল",
    subtitle: "৩ ব্যাগ প্রয়োজন",
  },
  {
    id: "4",
    type: "donor",
    latitude: 23.82,
    longitude: 90.4,
    bloodGroup: "A+",
    title: "রক্তদাতা",
    subtitle: "উপলব্ধ",
  },
  {
    id: "5",
    type: "donor",
    latitude: 23.79,
    longitude: 90.45,
    bloodGroup: "O-",
    title: "রক্তদাতা",
    subtitle: "উপলব্ধ",
  },
];

export function MockMap({
  markers = defaultMarkers,
  center = { lat: 23.8103, lng: 90.4125 },
  zoom = 12,
  height = "500px",
  onMarkerClick,
  onMapClick,
  showControls = true,
  selectedMarker,
}: MockMapProps) {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom,
  });

  // Get Mapbox token from environment
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.type === "request") {
      switch (marker.urgency) {
        case "critical":
          return "bg-red-600";
        case "urgent":
          return "bg-orange-500";
        default:
          return "bg-yellow-500";
      }
    }
    if (marker.type === "donor") return "bg-blue-500";
    if (marker.type === "volunteer") return "bg-purple-500";
    return "bg-gray-500";
  };

  const getMarkerIcon = (marker: MapMarker) => {
    if (marker.type === "request") return Droplet;
    return MapPin;
  };

  const handleMapClick = useCallback(
    (event: any) => {
      if (onMapClick) {
        onMapClick(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [onMapClick]
  );

  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ height }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Map controls */}
        {showControls && (
          <>
            <NavigationControl position="bottom-right" />
            <GeolocateControl
              position="bottom-right"
              onGeolocate={(e) => {
                if (onMapClick) {
                  onMapClick(e.coords.latitude, e.coords.longitude);
                }
              }}
            />
            <ScaleControl />
          </>
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
                    "relative flex flex-col items-center transition-transform",
                    isSelected && "scale-125"
                  )}
                >
                  {/* Pulse animation for critical */}
                  {marker.urgency === "critical" && (
                    <div className="absolute -inset-2 animate-ping rounded-full bg-red-600/30" />
                  )}

                  {/* Marker icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white",
                      getMarkerColor(marker),
                      isSelected && "ring-2 ring-blood-600 ring-offset-2"
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
                        <p className="text-xs text-muted-foreground mt-1">{marker.subtitle}</p>
                      )}
                      {marker.bloodGroup && (
                        <Badge className="mt-2" variant="default">
                          {marker.bloodGroup}
                        </Badge>
                      )}
                      {marker.urgency && (
                        <Badge
                          className={cn(
                            "mt-2 ml-1",
                            marker.urgency === "critical" && "bg-red-600",
                            marker.urgency === "urgent" && "bg-orange-500",
                            marker.urgency === "normal" && "bg-yellow-500"
                          )}
                        >
                          {marker.urgency === "critical" && "জরুরি"}
                          {marker.urgency === "urgent" && "দ্রুত"}
                          {marker.urgency === "normal" && "সাধারণ"}
                        </Badge>
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
          Powered by Mapbox
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow z-10">
        <p className="text-xs font-semibold mb-2">লেজেন্ড</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span>জরুরি</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>দ্রুত</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>সাধারণ</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>রক্তদাতা</span>
          </div>
        </div>
      </div>
    </div>
  );
}

