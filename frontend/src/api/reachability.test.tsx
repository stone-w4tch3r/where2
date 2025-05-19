import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import { useReachabilityQuery, ReachabilityQuery } from "./reachability";
import {
  ReachabilityResultSchema,
  ReachabilityResultDto,
} from "@/types/reachability";
import { StationDto } from "@/types/station";

vi.mock("@/api/client", () => ({
  axiosClient: {
    get: vi.fn(),
  },
}));

const createTestQueryClient: () => QueryClient = () =>
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

describe("useReachabilityQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReachableStation: StationDto = {
    id: "s1",
    fullName: "Reachable Station 1",
    transportMode: "train",
    latitude: 1,
    longitude: 1,
    country: "X",
    region: "Y",
  };
  const mockReachabilityData: ReachabilityResultDto = {
    origin: "originStation",
    maxTransfers: 1,
    totalCount: 1,
    reachableStations: [mockReachableStation],
  };

  const defaultParams: ReachabilityQuery = {
    stationId: "originStation",
    maxTransfers: 1,
  };

  it("should fetch and parse reachability data successfully", async () => {
    (axiosClient.get as vi.Mock).mockResolvedValue({
      data: mockReachabilityData,
    });
    const { result } = renderHook(() => useReachabilityQuery(defaultParams), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith("/reachability", {
      params: defaultParams,
    });
    expect(result.current.data).toEqual(mockReachabilityData);
    expect(() =>
      ReachabilityResultSchema.parse(result.current.data),
    ).not.toThrow();
  });

  it("should handle Zod validation error for reachability data", async () => {
    const malformedData = { origin: "test", stations: [{ name: "Invalid" }] }; // Missing fields, wrong structure
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: malformedData });
    const { result } = renderHook(() => useReachabilityQuery(defaultParams), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should pass query params correctly", async () => {
    const params: ReachabilityQuery = {
      stationId: "anotherStation",
      maxTransfers: 2,
    };
    (axiosClient.get as vi.Mock).mockResolvedValue({
      data: mockReachabilityData,
    });
    const { result } = renderHook(() => useReachabilityQuery(params), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith("/reachability", { params });
  });

  it("should be disabled if options.enabled is false", async () => {
    (axiosClient.get as vi.Mock).mockResolvedValue({
      data: mockReachabilityData,
    });
    const { result } = renderHook(
      () => useReachabilityQuery(defaultParams, { enabled: false }),
      { wrapper },
    );

    // Check that query is idle and no fetch was made
    expect(result.current.isIdle).toBe(true); // or isLoading: false, isFetching: false depending on RQ version and exact state
    expect(result.current.status).toBe("idle");
    expect(axiosClient.get).not.toHaveBeenCalled();
  });
});
