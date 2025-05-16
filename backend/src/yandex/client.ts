import { Result, success, failure } from "../utils/Result";
import {
  fetchStationsList,
  fetchStationSchedule,
  fetchThreadStations,
  fetchSchedule,
  StationScheduleParams,
  ThreadStationsParams,
  BetweenStationsScheduleParams,
  StationsListParams,
} from "./endpoints";
import { YandexStation } from "./schemas";

/**
 * Client for the Yandex Schedule API
 * Adapts the new endpoint API to match the old client API
 */
export class YandexRaspClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch station schedule
   */
  async getStationSchedule(params: StationScheduleParams) {
    return fetchStationSchedule(params);
  }

  /**
   * Fetch thread stations
   */
  async getThreadStations(params: { uid: string }) {
    const fullParams: ThreadStationsParams = {
      uid: params.uid,
      lang: "ru_RU",
      format: "json",
    };
    return fetchThreadStations(fullParams);
  }

  /**
   * Fetch stations list
   * Adapts the new API to return { stations: YandexStation[] } format
   */
  async getStationsList(
    params: any
  ): Promise<Result<{ stations: YandexStation[] }, string>> {
    try {
      const parsedParams: StationsListParams = {
        lang: params.lang || "ru_RU",
        format: params.format || "json",
      };

      const result = await fetchStationsList(parsedParams);

      if (!result.success) {
        return result;
      }

      // Transform the response to match the expected format
      const stations: YandexStation[] = [];

      // Extract stations from the countries->regions->settlements->stations structure
      result.data.countries.forEach((country) => {
        country.regions.forEach((region) => {
          region.settlements.forEach((settlement) => {
            settlement.stations.forEach((station) => {
              stations.push({
                title: station.title,
                code: station.codes.yandex_code || "",
                station_type: station.station_type || "",
                transport_type: station.transport_type,
                latitude:
                  typeof station.latitude === "number" ? station.latitude : 0,
                longitude:
                  typeof station.longitude === "number" ? station.longitude : 0,
              });
            });
          });
        });
      });

      return success({ stations });
    } catch (error) {
      return failure(`Error processing stations list: ${error}`);
    }
  }

  /**
   * Fetch schedule between stations
   */
  async getSchedule(from: string, to: string, date: string) {
    const params: BetweenStationsScheduleParams = {
      from,
      to,
      date,
    };
    return fetchSchedule(params);
  }
}
