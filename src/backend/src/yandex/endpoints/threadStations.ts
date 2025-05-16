import { YandexRaspClient } from "../client";
import { ThreadResponse, ThreadStop } from "../schemas";
import { Result } from "../../utils/Result";

export async function getThreadStations(
  client: YandexRaspClient,
  params: {
    uid: string;
    date?: string;
  }
): Promise<Result<ThreadStop[], string>> {
  const response = await client.getThreadStations(params);

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Unknown error",
    };
  }

  try {
    const data = response.data as ThreadResponse;

    return {
      success: true,
      data: data.stops,
    };
  } catch (error) {
    console.error("Error processing thread stations data:", error);
    return {
      success: false,
      error: "Failed to process thread stations data",
    };
  }
}
