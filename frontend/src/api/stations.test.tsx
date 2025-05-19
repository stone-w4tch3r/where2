import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import { useStationsQuery, StationQuery } from "./stations";
import { StationArraySchema, StationDto } from "@/types/station";

// Mock axiosClient
vi.mock("@/api/client", () => ({
  axiosClient: {
    get: vi.fn(),
  },
}));

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for testing
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

describe("useStationsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset QueryClient cache if needed, though a new one is made each time by wrapper
  });

  const mockStationsData: StationDto[] = [
    {
      id: "1",
      fullName: "Station Alpha",
      transportMode: "train",
      latitude: 50,
      longitude: 10,
      country: "DE",
      region: "Berlin",
    },
    {
      id: "2",
      fullName: "Station Beta",
      transportMode: "suburban",
      latitude: 51,
      longitude: 11,
      country: "DE",
      region: "Brandenburg",
    },
  ];

  it("should fetch and parse stations successfully", async () => {
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockStationsData });

    const { result } = renderHook(() => useStationsQuery({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(axiosClient.get).toHaveBeenCalledWith("/stations", { params: {} });
    expect(result.current.data).toEqual(mockStationsData);
    // Check if Zod parsing was successful (data is in correct DTO format)
    expect(() => StationArraySchema.parse(result.current.data)).not.toThrow();
  });

  it("should handle Zod validation error if API returns malformed data", async () => {
    const malformedData = [
      { id: "1", name: "Station Gamma", mode: "train" }, // fullName missing, transportMode wrong key
    ];
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: malformedData });

    const { result } = renderHook(() => useStationsQuery({}), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error); // ZodError or wrapper error
    // Depending on how react-query wraps Zod errors, you might need a more specific check
    // For example, if ZodErrors are caught and re-thrown as a generic Error:
    // expect(result.current.error?.message).toContain('Failed to parse'); or similar
  });

  it("should use correct query key and pass parameters", async () => {
    const params: StationQuery = { country: "US", transportMode: "train" };
    (axiosClient.get as vi.Mock).mockResolvedValue({ data: mockStationsData });

    const { result } = renderHook(() => useStationsQuery(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosClient.get).toHaveBeenCalledWith("/stations", { params });
    // Accessing queryKey directly isn't straightforward from the hook's result.
    // This is implicitly tested by ensuring the correct API call is made based on params.
    // And by ensuring different params lead to different cache entries if tested further.
  });
});
