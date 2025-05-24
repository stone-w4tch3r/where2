import { DetectedMap } from "../detectMaps/detectMaps";

export const filterMaps = (maps: DetectedMap[]): DetectedMap | Error => {
  if (!maps || maps.length < 0) {
    return new Error("Error while filtering detected maps");
  }

  if (maps.length === 0) {
    return new Error("No maps detected");
  }

  if (maps.length > 1) {
    return new Error("Multiple maps detected");
  }

  return maps[0];
};
