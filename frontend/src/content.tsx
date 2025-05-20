import React from "react";
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import { MapDetector, DetectedMap } from "./utils/MapDetector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "./store/StoreProvider";
import { StationsOverlay } from "./components/StationsOverlay/StationsOverlay";
import "leaflet/dist/leaflet.css";

// Inject required Leaflet CSS if not already present
const injectLeafletCSS = (): void => {
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("assets/leaflet.css");
    document.head.appendChild(link);
  }
};

class MapOverlayManager {
  private mapDetector: MapDetector = MapDetector.getInstance();
  private detectedMaps: DetectedMap[] = [];
  private overlayContainers: HTMLElement[] = [];
  private overlayRoots: Record<string, ReactDOM.Root> = {};
  private queryClient = new QueryClient();
  private overlayEnabled = true;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Get state from storage
    chrome.storage.local.get(["overlayEnabled"], (result) => {
      this.overlayEnabled = result.overlayEnabled !== false; // Default to true

      // Inject Leaflet CSS
      injectLeafletCSS();

      // Detect maps
      this.detectMaps();

      // Set up message listeners
      this.setupListeners();

      // Create observers to detect DOM changes that might add maps
      this.observeDOM();
    });
  }

  private detectMaps(): void {
    // Clear previous overlay containers
    this.cleanupOverlays();

    // Detect maps on the page
    this.detectedMaps = this.mapDetector.detectMaps();

    if (this.detectedMaps.length > 0) {
      // Notify background script that maps were found
      chrome.runtime.sendMessage({ type: "MAP_FOUND" });

      // Create overlays if enabled
      if (this.overlayEnabled) {
        this.createOverlays();
      }
    } else {
      // Notify background script that no maps were found
      chrome.runtime.sendMessage({ type: "MAP_NOT_FOUND" });
    }
  }

  private createOverlays(): void {
    this.detectedMaps.forEach((map, index) => {
      if (map.type === "leaflet") {
        this.createLeafletOverlay(map, index);
      } else if (map.type === "google") {
        // Google Maps overlay implementation would go here
        console.log("Google Maps overlay not yet implemented");
      }
    });
  }

  private createLeafletOverlay(map: DetectedMap, index: number): void {
    // Create a container for our overlay
    const overlayContainer = document.createElement("div");
    overlayContainer.className = "where2-overlay-container";
    overlayContainer.style.position = "absolute";
    overlayContainer.style.top = "0";
    overlayContainer.style.left = "0";
    overlayContainer.style.width = "100%";
    overlayContainer.style.height = "100%";
    overlayContainer.style.pointerEvents = "none";
    overlayContainer.style.zIndex = "1000";

    // Add the container to the map element
    map.element.appendChild(overlayContainer);
    this.overlayContainers.push(overlayContainer);

    // Create a root for React
    const root = createRoot(overlayContainer);
    this.overlayRoots[`map-${index}`] = root;

    // Create bounds from the element dimensions
    const bounds = this.createBoundsFromElement(map.element);

    // Render the stations overlay
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={this.queryClient}>
          <StoreProvider>
            <StationsOverlay bounds={bounds} />
          </StoreProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }

  private createBoundsFromElement(element: HTMLElement): {
    getSouth: () => number;
    getNorth: () => number;
    getWest: () => number;
    getEast: () => number;
    contains: () => boolean;
  } {
    // Get the element's dimensions
    const { width, height } = element.getBoundingClientRect();

    // Create a Leaflet bounds object with some default values
    // In a real implementation, this would use the actual map bounds
    const defaultCenter = [51.505, -0.09]; // London
    const defaultZoom = 13;

    // Create a simple bounds object that our component can use
    return {
      getSouth: () => defaultCenter[0] - 0.1,
      getNorth: () => defaultCenter[0] + 0.1,
      getWest: () => defaultCenter[1] - 0.1,
      getEast: () => defaultCenter[1] + 0.1,
      contains: () => true,
      // Add other methods that might be needed
    };
  }

  private cleanupOverlays(): void {
    // Unmount React components
    Object.values(this.overlayRoots).forEach((root) => {
      root.unmount();
    });

    // Remove overlay containers
    this.overlayContainers.forEach((container) => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    // Reset arrays and objects
    this.overlayContainers = [];
    this.overlayRoots = {};
  }

  private setupListeners(): void {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "ENABLE_OVERLAY") {
        this.overlayEnabled = true;
        this.createOverlays();
      } else if (message.type === "DISABLE_OVERLAY") {
        this.overlayEnabled = false;
        this.cleanupOverlays();
      }
    });
  }

  private observeDOM(): void {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldRedetect = false;

      mutations.forEach((mutation) => {
        // Check if added nodes might contain maps
        if (mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node instanceof HTMLElement) {
              if (
                node.classList.contains("leaflet-container") ||
                node.classList.contains("gm-style") ||
                node.className.includes("map") ||
                node.id.includes("map")
              ) {
                shouldRedetect = true;
                break;
              }
            }
          }
        }
      });

      if (shouldRedetect) {
        // Re-detect maps after a short delay to allow for initialization
        setTimeout(() => this.detectMaps(), 500);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "id"],
    });
  }
}

// Start the map overlay manager when the content script runs
const manager = new MapOverlayManager();
