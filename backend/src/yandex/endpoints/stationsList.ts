import { YandexRaspClient } from "../client";
import { Station, StationsListResponse } from "../schemas";
import { Result } from "../../utils/Result";

export async function getStationsList(
  client: YandexRaspClient,
  params: {
    country_code?: string;
    region?: string;
    transport_type?: string;
  }
): Promise<Result<Station[], string>> {
  const response = await client.getStationsList(params);

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Unknown error",
    };
  }

  try {
    const data = response.data as StationsListResponse;

    // Filter stations based on transport type if specified
    let stations = data.stations;
    if (params.transport_type) {
      stations = stations.filter(
        (station) => station.transport_type === params.transport_type
      );
    }

    return {
      success: true,
      data: stations,
    };
  } catch (error) {
    console.error("Error processing stations data:", error);
    return {
      success: false,
      error: "Failed to process stations data",
    };
  }
}
