import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { StationListItemContract } from "./baseSchemas";
import { StationsListResponse } from "./endpoints/stationsList";
import { getErrorMessage } from "../utils/errorHelpers";
import { Result, resultSuccess, resultError } from "../utils/Result";
import {
  AppError,
  NotFoundError,
  InternalError,
  ValidationError,
} from "../utils/errors";

// Import endpoint handlers
import {
  fetchStationSchedule,
  StationScheduleResponse,
} from "./endpoints/stationSchedule";
import {
  fetchThreadStations,
  ThreadStationsResponse,
} from "./endpoints/threadStations";
import { fetchStationsList } from "./endpoints/stationsList";
import {
  fetchSchedule,
  BetweenStationsScheduleResponse,
} from "./endpoints/betweenStationsSchedule";

// Define a type for transformed station data that includes region/country
type StationWithRegion = StationListItemContract & {
  region: string;
  country: string;
};

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

  private getApiConfig(): {
    baseUrl: string;
    apiKey: string;
    defaultParams: { format: string; lang: string };
  } {
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
  async getStationSchedule(params: {
    station: string;
    date?: string;
  }): Promise<Result<StationScheduleResponse, AppError>> {
    try {
      const result = await fetchStationSchedule(
        {
          station: params.station,
          date: params.date,
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig(),
      );
      if (result.success) {
        return resultSuccess(result.data);
      } else {
        return resultError(result.error);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(`Error fetching station schedule: ${message}`);
      return resultError(new InternalError(message));
    }
  }

  /**
   * Fetch thread stations
   */
  async getThreadStations(params: {
    uid: string;
  }): Promise<Result<ThreadStationsResponse, AppError>> {
    try {
      const result = await fetchThreadStations(
        {
          uid: params.uid,
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig(),
      );
      if (result.success) {
        return resultSuccess(result.data);
      } else {
        return resultError(result.error);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(`Error fetching thread stations: ${message}`);
      return resultError(new InternalError(message));
    }
  }

  /**
   * Fetch stations list
   */
  async getStationsList(): Promise<
    Result<{ stations: StationWithRegion[] }, AppError>
  > {
    try {
      const result = await fetchStationsList(
        {
          format: "json",
          lang: "ru_RU",
        },
        this.getApiConfig(),
      );
      if (result.success) {
        // Transform the response to match the expected format with stations array
        return resultSuccess(this.transformStationsResponse(result.data));
      } else {
        return resultError(result.error);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(`Error fetching stations list: ${message}`);
      return resultError(new InternalError(message));
    }
  }

  /**
   * Transform the stations list response into a flattened stations array
   */
  private transformStationsResponse(response: StationsListResponse): {
    stations: StationWithRegion[];
  } {
    // Extract and flatten stations from all countries, regions, and settlements
    const stations: StationWithRegion[] = [];

    if (response.countries) {
      response.countries.forEach((country) => {
        if (country.regions) {
          country.regions.forEach((region) => {
            if (region.settlements) {
              region.settlements.forEach((settlement) => {
                if (settlement.stations) {
                  settlement.stations.forEach((station) => {
                    // Create a station object with region/country metadata
                    const extendedStation: StationWithRegion = {
                      ...station,
                      country: country.title,
                      region: region.title,
                    };
                    stations.push(extendedStation);
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
  async getSchedule(
    from: string,
    to: string,
    date: string,
  ): Promise<Result<BetweenStationsScheduleResponse, AppError>> {
    try {
      const result = await fetchSchedule(
        { from, to, date },
        this.getApiConfig(),
      );
      if (result.success) {
        return resultSuccess(result.data);
      } else {
        return resultError(result.error);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(`Error fetching schedule: ${message}`);
      return resultError(new InternalError(message));
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
  }): Promise<Result<BetweenStationsScheduleResponse, AppError>> {
    try {
      const result = await fetchSchedule(
        {
          from: params.from,
          to: params.to,
          date: params.date,
        },
        this.getApiConfig(),
      );
      if (result.success) {
        return resultSuccess(result.data);
      } else {
        return resultError(result.error);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      this.logger.error(`Error searching routes: ${message}`);
      return resultError(new InternalError(message));
    }
  }
}
