import { useEffect, useState } from "react";
import { detectMaps } from "./detectMaps";
import type { DetectedMap } from "./types";

export interface MapDetectionResult {
  maps: DetectedMap[];
  isLoading: boolean;
  error: Error | null;
  refreshMaps: () => void;
}

export const useMapDetection = (): MapDetectionResult => {
  const [maps, setMaps] = useState<DetectedMap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshMaps = (): void => {
    try {
      setIsLoading(true);
      const detectedMaps = detectMaps();
      setMaps(detectedMaps);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to detect maps"));
      setIsLoading(false);
    }
  };

  // Initial detection
  useEffect(() => {
    refreshMaps();
  }, []);

  return {
    maps,
    isLoading,
    error,
    refreshMaps,
  };
};
