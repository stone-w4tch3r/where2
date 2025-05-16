import { Station, StationId } from "../models/Station";
import { YandexRaspClient } from "../yandex/client";
import { Result, success, failure } from "../utils/Result";

export class StationService {
  constructor(private readonly yandexClient: YandexRaspClient) {}

  async getStations(params: {
    countryCode?: string;
    region?: string;
    transportType?: string;
  }): Promise<Result<Station[]>> {
    try {
      const result = await this.yandexClient.getStationsList({
        country_code: params.countryCode,
        region: params.region,
        transport_type: params.transportType,
      });

      if (!result.success) {
        return failure(new Error(result.error));
      }

      const stations = result.data.stations.map(Station.fromYandexStation);
      return success(stations);
    } catch (error) {
      return failure(new Error(`Failed to fetch stations: ${error}`));
    }
  }

  async getStationById(stationId: StationId): Promise<Result<Station>> {
    try {
      // In a real app, this would query a database
      // For now, we'll fetch all stations and find by ID
      const stationsResult = await this.getStations({
        region: "sverdlovsk", // Default to Sverdlovsk region
      });

      if (!stationsResult.success) {
        return stationsResult;
      }

      const station = stationsResult.data.find(
        (s) => s.id.toString() === stationId.toString()
      );

      if (!station) {
        return failure(new Error(`Station not found: ${stationId}`));
      }

      return success(station);
    } catch (error) {
      return failure(new Error(`Failed to fetch station: ${error}`));
    }
  }
}
