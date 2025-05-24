import { useEffect, useState } from "react";
import { detectMaps } from "./detectMaps";
import type { DetectedMap } from "./detectMaps";
import { errorToString, isErrorLike } from "../errorHelpers";
import { filterMaps } from "./filterMaps";

export type MapDetectionResult = {
  map: DetectedMap | null;
  isLoading: boolean;
  error: Error | null;
  refreshMaps: () => void;
};

/**
 * React hook wrapper for map detection
 */
export const useDetectMap = (): MapDetectionResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filteredMap, setFilteredMap] = useState<DetectedMap | null>(null);

  const refreshMaps = (): void => {
    try {
      setIsLoading(true);
      const detectedMaps = detectMaps();
      const filterResult = filterMaps(detectedMaps);
      if (filterResult instanceof Error) {
        setError(filterResult);
      } else {
        setFilteredMap(filterResult);
      }
      setIsLoading(false);
    } catch (err) {
      setError(
        isErrorLike(err)
          ? new Error("Failed to detect maps: " + errorToString(err))
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
    map: filteredMap,
    isLoading,
    error,
    refreshMaps,
  };
};
