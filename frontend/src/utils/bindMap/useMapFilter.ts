import { DetectedMap } from "../detectMaps/detectMaps";

export const useMapFilter = ({
  maps,
  onError,
}: {
  maps: DetectedMap[];
  onError: (error: Error | null) => void;
}): DetectedMap | null => {
  if (!maps || maps.length < 0) {
    onError(new Error("Error while filtering detected maps"));
    return null;
  }

  if (maps.length === 0) {
    onError(new Error("No maps detected"));
    return null;
  }

  if (maps.length > 1) {
    onError(new Error("Multiple maps detected"));
    return null;
  }

  return maps[0];
};
