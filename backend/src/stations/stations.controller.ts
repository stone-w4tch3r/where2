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
import { StationDto } from "../shared/station.dto";

@ApiTags("stations")
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @ApiOperation({ summary: "Get all stations" })
  @ApiResponse({
    status: 200,
    description: "Returns all stations",
    type: [StationDto],
  })
  @Get()
  async findAll(@Query() filter: StationFilterDto): Promise<StationDto[]> {
    const result = await this.stationsService.findAll(filter);
    if (!result.success) throw result.error;
    return result.data.map((station) => new StationDto(station));
  }

  @ApiOperation({ summary: "Get stations by radius" })
  @ApiResponse({
    status: 200,
    description: "Returns stations within the radius",
    type: [StationDto],
  })
  @Get("by-radius")
  async findByRadius(@Query() query: FindByLocationDto): Promise<StationDto[]> {
    const result = await this.stationsService.findByRadius(
      query.latitude,
      query.longitude,
      query.radius,
    );
    if (!result.success) throw result.error;
    return result.data.map((station) => new StationDto(station));
  }

  @ApiOperation({ summary: "Find stations by name" })
  @ApiQuery({ name: "name", description: "Station name to search for" })
  @ApiResponse({
    status: 200,
    description: "Returns stations matching the name",
    type: [StationDto],
  })
  @Get("by-name")
  async findByName(@Query("name") name: string): Promise<StationDto[]> {
    const result = await this.stationsService.findByName(name);
    if (!result.success) throw result.error;
    return result.data.map((station) => new StationDto(station));
  }

  @ApiOperation({ summary: "Get station by ID" })
  @ApiParam({ name: "id", description: "Station ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the station",
    type: StationDto,
  })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<StationDto> {
    const result = await this.stationsService.findOne(id);
    if (!result.success) throw result.error;
    return new StationDto(result.data);
  }
}
