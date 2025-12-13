"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Phone, Globe, Navigation } from "lucide-react";
import { BootFitterWithDistance } from "@/lib/firestore/bootFitters";

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  country?: string;
  countryLong?: string;
}

export default function BootFitterLocator() {
  const [locationInput, setLocationInput] = useState("");
  const [radius, setRadius] = useState(50); // Stored in km internally
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoadingFitters, setIsLoadingFitters] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [fitters, setFitters] = useState<BootFitterWithDistance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  
  // Check if location is in UK
  const isUK = geocodeResult?.country === "GB";

  // Generate static map URL when we have location and fitters
  useEffect(() => {
    if (geocodeResult && fitters.length > 0) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found. Map will not be displayed.");
        setMapUrl(null);
        return;
      }

      // Build markers string: user location (blue) + boot fitters (red)
      const markers: string[] = [];
      
      // User location marker (blue)
      markers.push(`color:blue|label:U|${geocodeResult.lat},${geocodeResult.lng}`);
      
      // Boot fitter markers (red) - limit to first 10 for map clarity
      fitters.slice(0, 10).forEach((fitter, index) => {
        markers.push(`color:red|label:${index + 1}|${fitter.latitude},${fitter.longitude}`);
      });

      // Build markers parameter - don't encode the entire marker string, just join them
      const markersParam = markers.join("&markers=");
      const center = `${geocodeResult.lat},${geocodeResult.lng}`;
      const zoom = radius > 50 ? 10 : radius > 25 ? 11 : 12;
      
      // Build URL - Google Static Maps API handles the encoding
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=600x400&markers=${markersParam}&key=${apiKey}`;
      setMapUrl(staticMapUrl);
    } else {
      setMapUrl(null);
    }
  }, [geocodeResult, fitters, radius]);

  const handleSearch = async () => {
    if (!locationInput.trim()) {
      setError("Please enter a location");
      return;
    }

    setError(null);
    setIsGeocoding(true);

    try {
      // Geocode the location
      const geocodeResponse = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: locationInput }),
      });

      if (!geocodeResponse.ok) {
        const errorData = await geocodeResponse.json();
        throw new Error(errorData.error || "Failed to geocode location");
      }

      const geocodeData: GeocodeResult = await geocodeResponse.json();
      setGeocodeResult(geocodeData);

      // Fetch boot fitters - radius is always in km for API
      setIsLoadingFitters(true);
      const fittersResponse = await fetch(
        `/api/boot-fitters?lat=${geocodeData.lat}&lng=${geocodeData.lng}&radius=${radius}`
      );

      if (!fittersResponse.ok) {
        throw new Error("Failed to fetch boot fitters");
      }

      const fittersData = await fittersResponse.json();
      setFitters(fittersData.fitters || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setGeocodeResult(null);
      setFitters([]);
    } finally {
      setIsGeocoding(false);
      setIsLoadingFitters(false);
    }
  };


  // Convert km to miles (1 mile = 1.60934 km)
  const kmToMiles = (km: number): number => km / 1.60934;
  const milesToKm = (miles: number): number => miles * 1.60934;

  const formatDistance = (km: number, useMiles: boolean = false): string => {
    if (useMiles) {
      const miles = kmToMiles(km);
      if (miles < 1) {
        return `${Math.round(miles * 1760)}yd`;
      }
      return `${miles.toFixed(1)}mi`;
    }
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };
  
  // Get display radius (in miles for UK, km otherwise)
  const displayRadius = isUK ? Math.round(kmToMiles(radius)) : radius;
  const radiusUnit = isUK ? "mi" : "km";
  
  // Handle radius change - convert from miles to km if UK
  const handleRadiusChange = (newDisplayRadius: number) => {
    if (isUK) {
      setRadius(Math.round(milesToKm(newDisplayRadius)));
    } else {
      setRadius(newDisplayRadius);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Input and Radius Slider */}
      <div className="space-y-4">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col md:hidden gap-3">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Enter city, zip code, or postcode"
            className="flex-1 px-4 py-2 bg-[#040404] border border-[#F5E4D0]/20 rounded-lg text-[#F4F4F4] placeholder:text-[#F4F4F4]/50 focus:outline-none focus:border-[#F5E4D0]/40"
          />
          <Button
            onClick={handleSearch}
            disabled={isGeocoding || isLoadingFitters}
            variant="outline"
            size="lg"
            className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0] text-sm sm:text-base w-auto px-4 sm:px-8 h-10 sm:h-11 self-start"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Desktop/Tablet: Side-by-side layout */}
        <div className="hidden md:flex flex-col gap-4 w-full">
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Enter city, zip code, or postcode"
              className="w-full lg:w-auto lg:max-w-[300px] px-4 py-2 bg-[#040404] border border-[#F5E4D0]/20 rounded-lg text-[#F4F4F4] placeholder:text-[#F4F4F4]/50 focus:outline-none focus:border-[#F5E4D0]/40"
            />
            
            {/* Radius Slider and Search Button */}
            <div className="flex gap-4 items-center">
            {/* Radius Slider - Quiz Step Styling */}
            <div className="flex items-center justify-start border-[3px] border-[#F5E4D0]/10 px-4 py-3 flex-1 lg:min-w-[300px] rounded-[4px] transition-all duration-200">
              <div className="w-full flex items-center gap-3">
                <label className="text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    Radius: {displayRadius} {radiusUnit}
                </label>
                <input
                  type="range"
                    min={isUK ? "3" : "5"}
                    max={isUK ? "62" : "100"}
                    step={isUK ? "1" : "5"}
                    value={displayRadius}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                  className="flex-1 h-4 appearance-none cursor-pointer brutalist-slider"
                  style={{
                      background: `linear-gradient(to right, rgba(245, 228, 208, 0.3) 0%, rgba(245, 228, 208, 0.3) ${isUK ? ((displayRadius - 3) / 59) * 100 : ((radius - 5) / 95) * 100}%, transparent ${isUK ? ((displayRadius - 3) / 59) * 100 : ((radius - 5) / 95) * 100}%, transparent 100%)`
                  }}
                />
            </div>
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={isGeocoding || isLoadingFitters}
            variant="outline"
            size="lg"
                className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0] text-sm sm:text-base px-4 sm:px-8 h-10 sm:h-11 whitespace-nowrap"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Radius Slider */}
        <div className="space-y-2 md:hidden">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#F4F4F4]/80">
              Search Radius: {displayRadius} {radiusUnit}
            </label>
          </div>
          <div className="flex items-center justify-start border-[3px] border-[#F5E4D0]/10 px-4 py-3 rounded-[4px] transition-all duration-200">
            <input
              type="range"
              min={isUK ? "3" : "5"}
              max={isUK ? "62" : "100"}
              step={isUK ? "1" : "5"}
              value={displayRadius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-4 appearance-none cursor-pointer brutalist-slider"
              style={{
                background: `linear-gradient(to right, rgba(245, 228, 208, 0.3) 0%, rgba(245, 228, 208, 0.3) ${isUK ? ((displayRadius - 3) / 59) * 100 : ((radius - 5) / 95) * 100}%, transparent ${isUK ? ((displayRadius - 3) / 59) * 100 : ((radius - 5) / 95) * 100}%, transparent 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#F4F4F4]/50">
            <span>{isUK ? "3 mi" : "5 km"}</span>
            <span>{isUK ? "62 mi" : "100 km"}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results Section */}
      {geocodeResult && (
        <div className="space-y-4">
          <p className="text-sm text-[#F4F4F4]/70">
            Showing results near: <span className="font-medium text-[#F4F4F4]">{geocodeResult.formattedAddress}</span>
          </p>

          {isLoadingFitters ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#F5E4D0]" />
            </div>
          ) : fitters.length === 0 ? (
            <Card className="bg-[#2B2D30]/50">
              <CardContent className="p-6 text-center text-[#F4F4F4]/70">
                No boot fitters found within {displayRadius} {radiusUnit} of this location.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Boot Fitters List */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#F4F4F4]">
                  Found {fitters.length} boot fitter{fitters.length !== 1 ? "s" : ""}
                </h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {fitters.map((fitter) => (
                    <Card key={fitter.id} className="bg-[#2B2D30]/50">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-[#F4F4F4] text-base">
                              {fitter.name}
                            </h5>
                            <div className="flex items-center gap-1 text-[#F5E4D0] text-sm font-medium whitespace-nowrap">
                              <Navigation className="w-4 h-4" />
                              {formatDistance(fitter.distance, isUK)}
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm text-[#F4F4F4]/80">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#F5E4D0]/60" />
                            <div>
                              <p>{fitter.address}</p>
                              <p>
                                {fitter.city}
                                {fitter.state && `, ${fitter.state}`}
                                {fitter.zipCode && ` ${fitter.zipCode}`}
                              </p>
                              <p className="text-[#F4F4F4]/60">{fitter.country}</p>
                            </div>
                          </div>

                          {(fitter.phone || fitter.website) && (
                            <div className="flex flex-wrap gap-4 pt-2">
                              {fitter.phone && (
                                <a
                                  href={`tel:${fitter.phone}`}
                                  className="flex items-center gap-2 text-sm text-[#F5E4D0] hover:text-[#E8D4B8] transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  {fitter.phone}
                                </a>
                              )}
                              {fitter.website && (
                                <a
                                  href={fitter.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-[#F5E4D0] hover:text-[#E8D4B8] transition-colors"
                                >
                                  <Globe className="w-4 h-4" />
                                  Website
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Static Map */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#F4F4F4]">Map</h4>
                {mapUrl ? (
                  <>
                    <div className="rounded-lg overflow-hidden border border-[#F5E4D0]/20">
                      <img
                        src={mapUrl}
                        alt="Boot fitter locations"
                        className="w-full h-auto"
                        onError={async (e) => {
                          console.error("Failed to load map image");
                          console.error("Map URL:", mapUrl);
                          
                          // Try to fetch the URL to see the actual error from Google
                          if (mapUrl) {
                            try {
                              const response = await fetch(mapUrl);
                              const text = await response.text();
                              console.error("Google Maps API Error Response:", text);
                              
                              // Check if it's a JSON error response
                              try {
                                const json = JSON.parse(text);
                                console.error("Parsed error:", json);
                                if (json.error_message) {
                                  console.error("Error message:", json.error_message);
                                }
                              } catch {
                                // Not JSON, log as text
                                console.error("Error response (text):", text.substring(0, 500));
                              }
                            } catch (fetchError) {
                              console.error("Error fetching map URL:", fetchError);
                            }
                          }
                        }}
                        onLoad={() => {}}
                      />
                    </div>
                    <p className="text-xs text-[#F4F4F4]/50">
                      Blue marker: Your location | Red markers: Boot fitters
                    </p>
                  </>
                ) : (
                  <div className="rounded-lg border border-[#F5E4D0]/20 bg-[#2B2D30]/50 p-8 text-center">
                    <p className="text-sm text-[#F4F4F4]/60">
                      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 
                        ? "Map unavailable: Google Maps API key not configured"
                        : "Map loading..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

