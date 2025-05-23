import { useState, useMemo, useCallback } from "react";
import { makeBinding } from "../bindMap/bindMap";
import { DetectedMap } from "../detectMaps/detectMaps";

export const useBindMap = (
  map: DetectedMap,
  targetMap: L.Map | null,
): {
  bindMap: () => void;
  unbindMap: () => void;
  error: Error | null;
} => {
  const [error, setError] = useState<Error | null>(null);

  const { bind, unbind } = useMemo(() => {
    if (!targetMap) {
      return { bind: (): void => {}, unbind: (): void => {} };
    }
    return makeBinding(map, targetMap, setError);
  }, [map, targetMap]);

  const bindMap = useCallback(() => bind(), [bind]);
  const unbindMap = useCallback(() => unbind(), [unbind]);

  return { bindMap, unbindMap, error };
};
