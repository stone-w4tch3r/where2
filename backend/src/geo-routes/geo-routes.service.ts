import { Injectable, Logger } from "@nestjs/common";
import { GetByRadiusDto } from "./dto/get-by-radius.dto";
import { GetByBoxDto } from "./dto/get-by-box.dto";
import { StationsService } from "../stations/stations.service";
import { RoutesService } from "../routes/routes.service";
import { Station, RouteWithStops } from "../prisma/models"; // Assuming RouteWithStops is the correct type
import { Result, resultSuccess } from "../utils/Result"; // Corrected import
import { AppError } from "../utils/errors"; // Corrected import
import { StationFilterDto } from "../stations/dto/station-filter.dto";

@Injectable()
export class GeoRoutesService {
  private readonly logger = new Logger(GeoRoutesService.name);

  constructor(
    private readonly stationsService: StationsService,
    private readonly routesService: RoutesService,
  ) {}

  async getByRadius(
    getByRadiusDto: GetByRadiusDto,
  ): Promise<Result<RouteWithStops[], AppError>> {
    this.logger.log(
      `Fetching routes by radius: lat=${getByRadiusDto.latitude}, lon=${getByRadiusDto.longitude}, radius=${getByRadiusDto.radius}`,
    );

    const stationsResult = await this.stationsService.findByRadius(
      getByRadiusDto.latitude,
      getByRadiusDto.longitude,
      getByRadiusDto.radius,
    );

    if (!stationsResult.success) {
      this.logger.error(
        "Error fetching stations by radius",
        stationsResult.error,
      );
      return stationsResult;
    }

    const stations = stationsResult.data;
    if (!stations || stations.length === 0) {
      this.logger.log("No stations found for the given radius.");
      return resultSuccess([]);
    }

    return this.getRoutesForStations(stations);
  }

  async getByCoordinateBox(
    getByBoxDto: GetByBoxDto,
  ): Promise<Result<RouteWithStops[], AppError>> {
    this.logger.log(
      `Fetching routes by coordinate box: minLat=${getByBoxDto.minLatitude}, minLon=${getByBoxDto.minLongitude}, maxLat=${getByBoxDto.maxLatitude}, maxLon=${getByBoxDto.maxLongitude}`,
    );

    const filter: StationFilterDto = {
      minLat: getByBoxDto.minLatitude,
      minLon: getByBoxDto.minLongitude,
      maxLat: getByBoxDto.maxLatitude,
      maxLon: getByBoxDto.maxLongitude,
    };

    const stationsResult = await this.stationsService.findAll(filter);

    if (!stationsResult.success) {
      this.logger.error(
        "Error fetching stations by coordinate box",
        stationsResult.error,
      );
      return stationsResult;
    }

    const stations = stationsResult.data;
    if (!stations || stations.length === 0) {
      this.logger.log("No stations found for the given coordinate box.");
      return resultSuccess([]);
    }

    return this.getRoutesForStations(stations);
  }

  private async getRoutesForStations(
    stations: Station[],
  ): Promise<Result<RouteWithStops[], AppError>> {
    const allRoutes: RouteWithStops[] = [];
    const routeIds = new Set<string>();

    for (const station of stations) {
      const routesResult = await this.routesService.findByStation(station.id);
      if (!routesResult.success) {
        this.logger.warn(
          `Error fetching routes for station ${station.id}, skipping.`,
          routesResult.error,
        );
        continue;
      }

      const routesForStation = routesResult.data;
      if (routesForStation) {
        routesForStation.forEach((route) => {
          if (!routeIds.has(route.id)) {
            allRoutes.push(route);
            routeIds.add(route.id);
          }
        });
      }
    }
    this.logger.log(
      `Found ${allRoutes.length} unique routes for ${stations.length} stations.`,
    );
    return resultSuccess(allRoutes);
  }
}
