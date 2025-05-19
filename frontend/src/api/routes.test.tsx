import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import { useRoutesQuery, RoutesQuery } from "./routes";
import { RouteArraySchema, RouteDto } from "@/types/route";
import { StationDto } from "@/types/station";

vi.mock("@/api/client", () => ({
  axiosClient: {
    get: vi.fn(),
  },
}));

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useRoutesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStop: StationDto = {
    id: "s1",
    fullName: "Stop 1",
    transportMode: "train",
    latitude: 1,
    longitude: 1,
    country: "X",
    region: "Y",
  };
  const mockRoutesData: RouteDto[] = [
    {
      id: "r1",
      shortTitle: "R1",
      fullTitle: "Route 1",
      transportMode: "train",
      routeInfoUrl: "http://example.com/r1",
      stops: [mockStop],
    },
    {
      id: "r2",
      shortTitle: "R2",
      fullTitle: "Route 2",
      transportMode: "suburban",
      routeInfoUrl: "http://example.com/r2",
      stops: [],
    },
  ];

  it("should fetch all routes successfully when no params provided", async () => {
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockRoutesData });
    const { result } = renderHook(() => useRoutesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith("/routes", {
      params: undefined,
    });
    expect(result.current.data).toEqual(mockRoutesData);
    expect(() => RouteArraySchema.parse(result.current.data)).not.toThrow();
  });

  it("should fetch routes by stationId when stationId is provided", async () => {
    const stationId = "station123";
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockRoutesData });
    const { result } = renderHook(() => useRoutesQuery({ stationId }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith(
      `/routes/by-station/${stationId}`,
      { params: undefined },
    );
    expect(result.current.data).toEqual(mockRoutesData);
  });

  it("should fetch routes by transportMode when only transportMode is provided", async () => {
    const params: RoutesQuery = { transportMode: "bus" };
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockRoutesData });
    const { result } = renderHook(() => useRoutesQuery(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith("/routes", {
      params: { transportMode: "bus" },
    });
    expect(result.current.data).toEqual(mockRoutesData);
  });

  it("should prioritize stationId over transportMode for URL construction", async () => {
    const params: RoutesQuery = {
      stationId: "s456",
      transportMode: "suburban",
    };
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockRoutesData });
    const { result } = renderHook(() => useRoutesQuery(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // transportMode should not be in params if stationId is used for the path
    expect(axiosClient.get).toHaveBeenCalledWith(
      `/routes/by-station/${params.stationId}`,
      { params: undefined },
    );
  });

  it("should handle Zod validation error for routes", async () => {
    const malformedData = [{ id: "r1", name: "Route X" }]; // Missing required fields
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: malformedData });
    const { result } = renderHook(() => useRoutesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
