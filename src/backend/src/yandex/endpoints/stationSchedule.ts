import { YandexRaspClient } from "../client";
import { ScheduleItem, StationScheduleResponse } from "../schemas";
import { Result } from "../../utils/Result";

export async function getStationSchedule(
  client: YandexRaspClient,
  params: {
    station: string;
    date?: string;
    transport_type?: string;
  }
): Promise<Result<ScheduleItem[], string>> {
  const response = await client.getStationSchedule(params);

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Unknown error",
    };
  }

  try {
    const data = response.data as StationScheduleResponse;

    // Filter schedules based on transport type if specified
    let schedules = data.schedule;
    if (params.transport_type) {
      schedules = schedules.filter(
        (item) => item.thread.transport_type === params.transport_type
      );
    }

    return {
      success: true,
      data: schedules,
    };
  } catch (error) {
    console.error("Error processing station schedule data:", error);
    return {
      success: false,
      error: "Failed to process station schedule data",
    };
  }
}
