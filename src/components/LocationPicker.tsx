"use client";

import { useState, useEffect, useCallback } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, MapLayerMouseEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reverseGeocode, searchPlaces, GeocodeResult } from "@/lib/map-utils";
import { cn } from "@/lib/utils";

// Default location (Dhaka)
const DEFAULT_CENTER = {
    latitude: 23.8103,
    longitude: 90.4125,
    zoom: 12,
};

interface LocationValue {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
}

interface LocationPickerProps {
    value?: Partial<LocationValue>;
    onChange: (value: LocationValue) => void;
    error?: string;
    className?: string;
}

export function LocationPicker({ value, onChange, error, className }: LocationPickerProps) {
    const [viewState, setViewState] = useState(DEFAULT_CENTER);
    const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
        value?.latitude && value?.longitude ? { latitude: value.latitude, longitude: value.longitude } : null
    );
    const [address, setAddress] = useState(value?.address || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Update internal state when props change
    useEffect(() => {
        if (value?.latitude && value?.longitude) {
            setMarker({ latitude: value.latitude, longitude: value.longitude });
            setViewState((prev) => ({
                ...prev,
                latitude: value.latitude!,
                longitude: value.longitude!,
            }));
        }
        if (value?.address) {
            setAddress(value.address);
        }
    }, [value]);

    const handleMapClick = useCallback(async (event: MapLayerMouseEvent) => {
        const { lat, lng } = event.lngLat;
        setMarker({ latitude: lat, longitude: lng });
        setIsLoadingAddress(true);

        try {
            const result = await reverseGeocode(lng, lat);
            const newAddress = result?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            const locationName = result?.text || "Selected Location";

            setAddress(newAddress);
            onChange({
                latitude: lat,
                longitude: lng,
                address: newAddress,
                name: locationName,
            });
        } catch (error) {
            console.error("Error fetching address:", error);
            // Still update coordinates even if address fails
            onChange({
                latitude: lat,
                longitude: lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
        } finally {
            setIsLoadingAddress(false);
        }
    }, [onChange]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await searchPlaces(searchQuery, {
                country: "bd", // Limit to Bangladesh
                limit: 5
            } as any); // Type assertion needed if map-utils types are strict
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (result: GeocodeResult) => {
        const [lng, lat] = result.center;
        setMarker({ latitude: lat, longitude: lng });
        setViewState({
            latitude: lat,
            longitude: lng,
            zoom: 14,
        });
        setAddress(result.place_name);
        setSearchQuery("");
        setSearchResults([]);

        onChange({
            latitude: lat,
            longitude: lng,
            address: result.place_name,
            name: result.text,
        });
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <Label>লোকেশন খুঁজুন</Label>
                <div className="relative">
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search location (e.g., Dhaka Medical College)"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted focus:bg-muted"
                                    onClick={() => selectSearchResult(result)}
                                >
                                    <div className="font-medium">{result.text}</div>
                                    <div className="text-xs text-muted-foreground truncate">{result.place_name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative h-[300px] w-full rounded-md border overflow-hidden">
                <Map
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    onClick={handleMapClick}
                    cursor="crosshair"
                >
                    <NavigationControl position="bottom-right" />
                    <GeolocateControl position="top-right" />

                    {marker && (
                        <Marker latitude={marker.latitude} longitude={marker.longitude} anchor="bottom">
                            <MapPin className="h-8 w-8 text-blood-600 fill-blood-100 -mb-1 animate-bounce" />
                        </Marker>
                    )}
                </Map>

                {isLoadingAddress && (
                    <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Getting address...
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {address && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    <span className="font-medium text-foreground">Selected:</span> {address}
                </div>
            )}
        </div>
    );
}
