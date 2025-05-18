import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { StationsService } from "./stations.service";
import { FindByLocationDto } from "./dto/find-by-location.dto";
import { StationFilterDto } from "./dto/station-filter.dto";

@ApiTags("stations")
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @ApiOperation({ summary: "Get all stations" })
  @ApiResponse({ status: 200, description: "Returns all stations" })
  @Get()
  async findAll(@Query() filter: StationFilterDto) {
    return this.stationsService.findAll(filter);
  }

  @ApiOperation({ summary: "Get stations by location" })
  @ApiResponse({
    status: 200,
    description: "Returns stations near the location",
  })
  @Get("by-location")
  async findByLocation(@Query() query: FindByLocationDto) {
    return this.stationsService.findByCoordinates(
      query.latitude,
      query.longitude,
      query.radius,
    );
  }

  @ApiOperation({ summary: "Get station by ID" })
  @ApiParam({ name: "id", description: "Station ID" })
  @ApiResponse({ status: 200, description: "Returns the station" })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.stationsService.findOne(id);
  }

  @ApiOperation({ summary: "Find stations by name" })
  @ApiQuery({ name: "name", description: "Station name to search for" })
  @ApiResponse({
    status: 200,
    description: "Returns stations matching the name",
  })
  @Get("search/name")
  async findByName(@Query("name") name: string) {
    return this.stationsService.findByName(name);
  }
}
