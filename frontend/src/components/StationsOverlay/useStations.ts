import { useEffect } from "react";
import { LatLngBounds } from "leaflet";
import { useStationsQuery } from "@/api/stations";
import { useStore } from "@/store";
import { StationDto } from "@/types/station";

/**
 * Hook to fetch stations based on current map bounds and update the store
 * @param bounds - The map bounds to use for querying stations
 * @returns Object with stations data and loading/error states
 */
export const useStations = (
  bounds: LatLngBounds,
): {
  stations: StationDto[];
  isLoading: boolean;
  error: Error | null;
} => {
  const setStations = useStore((state) => state.setStations);

  const params = {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLon: bounds.getWest(),
    maxLon: bounds.getEast(),
  };

  const { data, isLoading, error } = useStationsQuery(params);

  // Update store when data changes
  useEffect(() => {
    if (data) {
      setStations(data);
    }
  }, [data, setStations]);

  return {
    stations: data || ([] as StationDto[]),
    isLoading: isLoading && !!params, // Only show loading when actually fetching
    error: error,
  };
};
