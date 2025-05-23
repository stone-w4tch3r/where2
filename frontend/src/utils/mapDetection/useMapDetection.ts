import { useEffect, useState } from "react";
import { detectMaps } from "./detectMaps";
import type { DetectedMap } from "./detectMaps";

export interface MapDetectionResult {
  maps: DetectedMap[];
  isLoading: boolean;
  error: Error | null;
  refreshMaps: () => void;
}

/**
 * React hook wrapper for map detection
 */
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
      setError(
        err instanceof Error
          ? new Error("Failed to detect maps: " + err.toString())
          : new Error("Failed to detect maps: unknown error"),
      );
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
