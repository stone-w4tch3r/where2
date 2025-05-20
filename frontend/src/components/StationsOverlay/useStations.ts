import { useEffect, useMemo } from "react";
import L from "leaflet";
import { useStationsQuery } from "@/api/stations";
import { useStore } from "@/store";
import { StationDto } from "@/types/station";

/**
 * Hook to fetch stations based on current map bounds and update the store
 * @param bounds - The map bounds to use for querying stations
 * @returns Object with stations data and loading/error states
 */
export const useStations = (
  bounds: L.LatLngBounds,
): {
  stations: StationDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} => {
  const setStations = useStore((state) => state.setStations);

  const params = {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLon: bounds.getWest(),
    maxLon: bounds.getEast(),
  };

  const { data, isLoading, isError, error } = useStationsQuery(params);

  // Debug logging for API response
  useEffect(() => {
    if (isError) {
      console.error("Error fetching stations:", error);
    }
  }, [data, isError, error]);

  // Update store when data changes
  useEffect(() => {
    if (data) {
      setStations(data);
    }
  }, [data, setStations]);

  return {
    stations: data || ([] as StationDto[]),
    isLoading: isLoading && !!params, // Only show loading when actually fetching
    isError,
    error,
  };
};
