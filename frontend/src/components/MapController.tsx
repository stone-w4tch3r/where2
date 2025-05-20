import React, { useState } from "react";
import { useMapDetection } from "../utils/useMapDetection";
import type { LatLngTuple } from "leaflet";

interface MapControllerProps {
  /** Auto-refresh interval in milliseconds (default: 5000) */
  refreshInterval?: number;
  /** If true, starts in a minimized state */
  startMinimized?: boolean;
}

/**
 * MapController component provides a UI to detect and interact with maps on the page
 * from different providers (Leaflet, Google Maps, Yandex Maps)
 */
const MapController: React.FC<MapControllerProps> = ({
  refreshInterval = 5000,
  startMinimized = false,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(startMinimized);
  const [selectedMapIndex, setSelectedMapIndex] = useState<number>(0);
  const [customLocation, setCustomLocation] = useState<{
    lat: string;
    lng: string;
    zoom: string;
  }>({
    lat: "55.751",
    lng: "37.618",
    zoom: "12",
  });

  // Use our custom hook to detect maps
  const { maps, isLoading, error, refreshMaps, focusMap } =
    useMapDetection(refreshInterval);

  const handleFocusMap = (): void => {
    const lat = parseFloat(customLocation.lat);
    const lng = parseFloat(customLocation.lng);
    const zoom = parseInt(customLocation.zoom, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
      alert("Please enter valid coordinates and zoom level");
      return;
    }

    const success = focusMap(selectedMapIndex, [lat, lng] as LatLngTuple, zoom);
    if (!success) {
      alert("Failed to focus the map. The map may not support this operation.");
    }
  };

  if (isMinimized) {
    return (
      <div className="map-controller map-controller--minimized">
        <button
          onClick={() => setIsMinimized(false)}
          title="Open Map Controller"
        >
          🗺️
        </button>
      </div>
    );
  }

  return (
    <div className="map-controller">
      <div className="map-controller__header">
        <h3>Map Controller</h3>
        <button onClick={() => setIsMinimized(true)} title="Minimize">
          ➖
        </button>
      </div>

      <div className="map-controller__content">
        <div className="map-controller__status">
          {isLoading ? (
            <p>Scanning for maps...</p>
          ) : error ? (
            <p className="error">Error: {error.message}</p>
          ) : maps.length === 0 ? (
            <p>No maps detected on this page.</p>
          ) : (
            <p>Detected {maps.length} map(s) on this page.</p>
          )}
          <button onClick={refreshMaps}>Refresh</button>
        </div>

        {maps.length > 0 && (
          <>
            <div className="map-controller__selector">
              <label htmlFor="map-selector">Select Map:</label>
              <select
                id="map-selector"
                value={selectedMapIndex}
                onChange={(e) =>
                  setSelectedMapIndex(parseInt(e.target.value, 10))
                }
              >
                {maps.map((map, index) => (
                  <option key={index} value={index}>
                    {map.type} Map {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-controller__details">
              <h4>Selected Map Details:</h4>
              <p>Type: {maps[selectedMapIndex]?.type}</p>
              <p>
                Bounds:{" "}
                {maps[selectedMapIndex]?.bounds
                  ? `${maps[selectedMapIndex]?.bounds
                      ?.getSouthWest()
                      .toString()} to ${maps[selectedMapIndex]?.bounds
                      ?.getNorthEast()
                      .toString()}`
                  : "Not available"}
              </p>
            </div>

            <div className="map-controller__actions">
              <h4>Focus Map:</h4>
              <div className="map-controller__input-group">
                <label htmlFor="lat">Latitude:</label>
                <input
                  id="lat"
                  type="text"
                  value={customLocation.lat}
                  onChange={(e) =>
                    setCustomLocation({
                      ...customLocation,
                      lat: e.target.value,
                    })
                  }
                />
              </div>
              <div className="map-controller__input-group">
                <label htmlFor="lng">Longitude:</label>
                <input
                  id="lng"
                  type="text"
                  value={customLocation.lng}
                  onChange={(e) =>
                    setCustomLocation({
                      ...customLocation,
                      lng: e.target.value,
                    })
                  }
                />
              </div>
              <div className="map-controller__input-group">
                <label htmlFor="zoom">Zoom:</label>
                <input
                  id="zoom"
                  type="text"
                  value={customLocation.zoom}
                  onChange={(e) =>
                    setCustomLocation({
                      ...customLocation,
                      zoom: e.target.value,
                    })
                  }
                />
              </div>
              <button onClick={handleFocusMap}>Focus Map</button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .map-controller {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 300px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }

        .map-controller--minimized {
          width: auto;
          height: auto;
          padding: 0;
        }

        .map-controller__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ccc;
        }

        .map-controller__header h3 {
          margin: 0;
          font-size: 16px;
        }

        .map-controller__content {
          padding: 10px;
        }

        .map-controller__status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .map-controller__selector {
          margin-bottom: 15px;
        }

        .map-controller__details {
          margin-bottom: 15px;
        }

        .map-controller__details h4 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .map-controller__actions h4 {
          margin: 0 0 10px;
          font-size: 14px;
        }

        .map-controller__input-group {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .map-controller__input-group input {
          width: 70%;
        }

        button {
          padding: 5px 10px;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 3px;
          cursor: pointer;
        }

        button:hover {
          background-color: #e0e0e0;
        }

        .error {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default MapController;
