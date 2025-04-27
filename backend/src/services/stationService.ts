import type { Station } from "../domain/entities"
import type { StationId } from "../domain/valueObjects"
import type { StationRepository } from "../repositories/stationRepository"
import type { Result } from "../external/yandex/utils/result"

export class StationService {
  constructor(private readonly stationRepository: StationRepository) {}

  /**
   * Gets all stations
   */
  async getAllStations(): Promise<Result<Station[]>> {
    return this.stationRepository.findAll()
  }

  /**
   * Gets a station by ID
   */
  async getStationById(id: StationId): Promise<Result<Station | null>> {
    return this.stationRepository.findById(id)
  }

  /**
   * Gets stations by region
   */
  async getStationsByRegion(region: string): Promise<Result<Station[]>> {
    return this.stationRepository.findByRegion(region)
  }

  /**
   * Saves a station
   */
  async saveStation(station: Station): Promise<Result<Station>> {
    return this.stationRepository.save(station)
  }
}
