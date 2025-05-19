import { describe, it, expect, vi } from "vitest";
import { type UiSlice, createUiSlice } from "./uiSlice";

// A helper to get the state from the slice creator
const getInitialState = (): UiSlice => {
  const initialState = createUiSlice(
    vi.fn() as any, // mock set
    vi.fn() as any, // mock get
    vi.fn() as any, // mock api
  );
  return initialState;
};

describe("uiSlice", (): void => {
  it("should have correct default state", (): void => {
    const initialState = getInitialState();
    expect(initialState.overlayVisible).toBe(true);
    expect(initialState.selectedStationId).toBeNull();
    expect(initialState.selectedRouteId).toBeNull();
    expect(initialState.maxTransfers).toBe(0);
    expect(initialState.circleRadiusKm).toBe(1);
  });

  it("setOverlayVisible should update overlayVisible state", (): void => {
    const set = vi.fn();
    const slice = createUiSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setOverlayVisible(false);
    expect(set).toHaveBeenCalledWith(expect.any(Function));
    const updater = set.mock.calls[0][0];
    expect(updater({} as UiSlice)).toEqual({ overlayVisible: false });
  });

  it("setSelectedStationId should update selectedStationId state", (): void => {
    const set = vi.fn();
    const slice = createUiSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setSelectedStationId("station-123");
    const updater = set.mock.calls[0][0];
    expect(updater({} as UiSlice)).toEqual({
      selectedStationId: "station-123",
    });
  });

  it("setSelectedRouteId should update selectedRouteId state", (): void => {
    const set = vi.fn();
    const slice = createUiSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setSelectedRouteId("route-456");
    const updater = set.mock.calls[0][0];
    expect(updater({} as UiSlice)).toEqual({ selectedRouteId: "route-456" });
  });

  it("setMaxTransfers should update maxTransfers state", (): void => {
    const set = vi.fn();
    const slice = createUiSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setMaxTransfers(2);
    const updater = set.mock.calls[0][0];
    expect(updater({} as UiSlice)).toEqual({ maxTransfers: 2 });
  });

  it("setCircleRadiusKm should update circleRadiusKm state", (): void => {
    const set = vi.fn();
    const slice = createUiSlice(set as any, vi.fn() as any, vi.fn() as any);
    slice.setCircleRadiusKm(5);
    const updater = set.mock.calls[0][0];
    expect(updater({} as UiSlice)).toEqual({ circleRadiusKm: 5 });
  });
});
