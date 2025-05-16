import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { YandexStation, ScheduleItem } from "./entities/yandex-schemas";
import { StationsListResponse } from "./endpoints/stationsList";

// Import endpoint handlers
import { fetchStationSchedule } from "./endpoints/stationSchedule";
import { fetchThreadStations } from "./endpoints/threadStations";
import { fetchStationsList } from "./endpoints/stationsList";
import { fetchSchedule } from "./endpoints/betweenStationsSchedule";

@Injectable()
export class YandexService {
  private apiKey: string;
  private baseUrl: string;
  private readonly logger = new Logger(YandexService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("YANDEX_API_KEY");
    if (!apiKey) {
      throw new Error("YANDEX_API_KEY is not defined in environment variables");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://api.rasp.yandex.net/v3.0";
  }

  /**
   * Creates an axios instance with default configuration
   */
  private createApiInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      params: {
        apikey: this.apiKey,
        format: "json",
        lang: "ru_RU",
      },
    });
  }

  private getApiConfig() {
    return {
      baseUrl: this.baseUrl.endsWith("/") ? this.baseUrl : this.baseUrl + "/",
      apiKey: this.apiKey,
      defaultParams: {
        format: "json",
        lang: "ru_RU",
      },
    };
  }

  /**
   * Fetch station schedule
   */
  async getStationSchedule(params: { station: string; date?: string }) {
    try {
      const result = await fetchStationSchedule(
        {
          station: params.station,
          date: params.date,
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig()
      );
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      this.logger.error(`Error fetching station schedule: ${error.message}`);
      throw new Error(`Error fetching station schedule: ${error.message}`);
    }
  }

  /**
   * Fetch thread stations
   */
  async getThreadStations(params: { uid: string }) {
    try {
      const result = await fetchThreadStations(
        {
          uid: params.uid,
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig()
      );
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      this.logger.error(`Error fetching thread stations: ${error.message}`);
      throw new Error(`Error fetching thread stations: ${error.message}`);
    }
  }

  /**
   * Fetch stations list
   */
  async getStationsList(): Promise<{ stations: YandexStation[] }> {
    try {
      const result = await fetchStationsList(
        {
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig()
      );
      if (result.success) {
        // Transform the response to match the expected format with stations array
        return this.transformStationsResponse(result.data);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      this.logger.error(`Error fetching stations list: ${error.message}`);
      throw new Error(`Error fetching stations list: ${error.message}`);
    }
  }

  /**
   * Transform the stations list response into a flattened stations array
   */
  private transformStationsResponse(response: StationsListResponse): {
    stations: YandexStation[];
  } {
    // Extract and flatten stations from all countries, regions, and settlements
    const stations: YandexStation[] = [];

    if (response.countries) {
      response.countries.forEach((country) => {
        if (country.regions) {
          country.regions.forEach((region) => {
            if (region.settlements) {
              region.settlements.forEach((settlement) => {
                if (settlement.stations) {
                  settlement.stations.forEach((station) => {
                    // Get the Yandex code from codes object
                    const code =
                      station.codes?.yandex_code ||
                      station.codes?.esr_code ||
                      `station_${stations.length}`;

                    stations.push({
                      code: code,
                      title: station.title,
                      station_type: station.station_type || "",
                      transport_type: station.transport_type,
                      latitude: station.latitude || 0,
                      longitude: station.longitude || 0,
                      country: country.title,
                      region: region.title,
                    });
                  });
                }
              });
            }
          });
        }
      });
    }

    return { stations };
  }

  /**
   * Fetch schedule between stations
   */
  async getSchedule(from: string, to: string, date: string) {
    try {
      const result = await fetchSchedule(
        { from, to, date },
        this.getApiConfig()
      );
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      this.logger.error(`Error fetching schedule: ${error.message}`);
      throw new Error(`Error fetching schedule: ${error.message}`);
    }
  }

  /**
   * Search for routes between stations with a departure date within the specified timeframe
   */
  async searchRoutes(params: {
    from: string;
    to: string;
    date: string;
    transport_types?: string;
  }) {
    try {
      const result = await fetchSchedule(
        {
          from: params.from,
          to: params.to,
          date: params.date,
        },
        this.getApiConfig()
      );
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      this.logger.error(`Error searching routes: ${error.message}`);
      throw new Error(`Error searching routes: ${error.message}`);
    }
  }
}
