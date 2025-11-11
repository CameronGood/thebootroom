"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { detectRegion, setRegion as setStoredRegion, getStoredRegion, Region } from "./getRegion";

interface RegionContextType {
  region: Region | null;
  loading: boolean;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  loading: true,
  setRegion: () => {},
});

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegion = async () => {
      // Check localStorage first
      const stored = getStoredRegion();
      if (stored) {
        setRegionState(stored);
        setLoading(false);
        return;
      }

      // Detect from IP
      try {
        const detected = await detectRegion();
        setRegionState(detected);
      } catch (error) {
        console.error("Failed to detect region:", error);
        setRegionState("US"); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, []);

  const setRegion = (newRegion: Region) => {
    setStoredRegion(newRegion);
    setRegionState(newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, loading, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return context;
}

