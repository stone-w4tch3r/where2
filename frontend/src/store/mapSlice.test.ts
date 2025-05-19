import { describe, it, expect, vi } from "vitest";
import { type MapSlice, createMapSlice } from "./mapSlice";

const getInitialState = (): MapSlice => {
  const initialState = createMapSlice(
    vi.fn() as any,
    vi.fn() as any,
    vi.fn() as any,
  );
  return initialState;
};

describe("mapSlice", (): void => {
  it("should have correct default state", (): void => {
    const initialState = getInitialState();
    expect(initialState.mapProvider).toBe("openstreetmap");
    expect(initialState.mapCenter).toEqual([56.8389, 60.6057]);
    expect(initialState.mapZoom).toBe(10);
    expect(initialState.highlightedElements).toBeNull();
  });

  it("setMapProvider should update mapProvider state", (): void => {
    const set = vi.fn();
    const slice = createMapSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setMapProvider("google-maps");
    const updater = set.mock.calls[0][0];
    expect(updater({} as MapSlice)).toEqual({ mapProvider: "google-maps" });
  });

  it("setMapCenter should update mapCenter state", (): void => {
    const set = vi.fn();
    const slice = createMapSlice(set as any, vi.fn() as any, vi.fn() as any);
    const newCenter: [number, number] = [40.7128, -74.006];
    slice.setMapCenter(newCenter);
    const updater = set.mock.calls[0][0];
    expect(updater({} as MapSlice)).toEqual({ mapCenter: newCenter });
  });

  it("setMapZoom should update mapZoom state", (): void => {
    const set = vi.fn();
    const slice = createMapSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setMapZoom(15);
    const updater = set.mock.calls[0][0];
    expect(updater({} as MapSlice)).toEqual({ mapZoom: 15 });
  });

  it("setHighlightedElements should update highlightedElements state", (): void => {
    const set = vi.fn();
    const slice = createMapSlice(set as any, vi.fn() as any, vi.fn() as any);
    const highlights = ["id1", "id2"];
    slice.setHighlightedElements(highlights);
    const updater = set.mock.calls[0][0];
    expect(updater({} as MapSlice)).toEqual({
      highlightedElements: highlights,
    });
  });
});
