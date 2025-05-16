import { Station, StationId } from "../models/Station";
import { DatabaseService } from "./DatabaseService";
import { Result, success, failure } from "../utils/Result";

export class StationService {
  constructor(private readonly dbService: DatabaseService) {}

  async getStations(params: {
    countryCode?: string;
    region?: string;
    transportType?: string;
  }): Promise<Result<Station[]>> {
    try {
      // Get all stations from database
      const stations = await this.dbService.getAllStations();

      // Apply filters if provided
      let filteredStations = stations;

      if (params.countryCode) {
        filteredStations = filteredStations.filter(
          (s) => s.country === params.countryCode
        );
      }

      if (params.region) {
        filteredStations = filteredStations.filter((s) =>
          s.region?.toLowerCase().includes(params.region!.toLowerCase())
        );
      }

      if (params.transportType) {
        filteredStations = filteredStations.filter(
          (s) => s.mode === params.transportType
        );
      }

      return success(filteredStations);
    } catch (error) {
      return failure(new Error(`Failed to fetch stations: ${error}`));
    }
  }

  async getStationById(stationId: StationId): Promise<Result<Station>> {
    try {
      const station = await this.dbService.getStationById(stationId.toString());

      if (!station) {
        return failure(new Error(`Station not found: ${stationId}`));
      }

      return success(station);
    } catch (error) {
      return failure(new Error(`Failed to fetch station: ${error}`));
    }
  }
}
