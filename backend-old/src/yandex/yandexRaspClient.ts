import { Result, success, failure } from "../utils/Result";
import { yandexApiConfig } from "./apiConfig";
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
  private lang: "ru_RU" | "uk_UA";
  private format: "json" | "xml";

  constructor() {
    this.lang = yandexApiConfig.defaultParams.lang;
    this.format = yandexApiConfig.defaultParams.format;
  }

  /**
   * Fetch station schedule
   */
  async getStationSchedule(
    params: Omit<StationScheduleParams, "lang" | "format">
  ) {
    return fetchStationSchedule({
      ...params,
      lang: this.lang,
      format: this.format,
    });
  }

  /**
   * Fetch thread stations
   */
  async getThreadStations(params: { uid: string }) {
    const fullParams: ThreadStationsParams = {
      uid: params.uid,
      lang: this.lang,
      format: this.format,
    };
    return fetchThreadStations(fullParams);
  }

  /**
   * Fetch stations list
   * Adapts the new API to return { stations: YandexStation[] } format
   */
  async getStationsList(): Promise<
    Result<{ stations: YandexStation[] }, string>
  > {
    try {
      const parsedParams: StationsListParams = {
        lang: this.lang,
        format: this.format,
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
