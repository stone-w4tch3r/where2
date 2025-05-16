import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { StationsService } from "./stations.service";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { FindByLocationDto } from "./dto/find-by-location.dto";

@ApiTags("stations")
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @ApiOperation({ summary: "Get all stations" })
  @ApiResponse({ status: 200, description: "Returns all stations" })
  @Get()
  async findAll() {
    const result = await this.stationsService.findAll();
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Get station by ID" })
  @ApiParam({ name: "id", description: "Station ID" })
  @ApiResponse({ status: 200, description: "Returns the station" })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.stationsService.findOne(id);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Get stations by location" })
  @ApiResponse({
    status: 200,
    description: "Returns stations near the location",
  })
  @Get("by-location")
  async findByLocation(@Query() query: FindByLocationDto) {
    const result = await this.stationsService.findByCoordinates(
      query.latitude,
      query.longitude,
      query.radius
    );
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Create a new station" })
  @ApiResponse({ status: 201, description: "Station created successfully" })
  @Post()
  async create(@Body() createStationDto: CreateStationDto) {
    const result = await this.stationsService.create(createStationDto);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Update a station" })
  @ApiParam({ name: "id", description: "Station ID" })
  @ApiResponse({ status: 200, description: "Station updated successfully" })
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateStationDto: UpdateStationDto
  ) {
    const result = await this.stationsService.update(id, updateStationDto);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Delete a station" })
  @ApiParam({ name: "id", description: "Station ID" })
  @ApiResponse({ status: 200, description: "Station deleted successfully" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const result = await this.stationsService.remove(id);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Find stations by name" })
  @ApiQuery({ name: "name", description: "Station name to search for" })
  @ApiResponse({
    status: 200,
    description: "Returns stations matching the name",
  })
  @Get("search/name")
  async findByName(@Query("name") name: string) {
    const result = await this.stationsService.findByName(name);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }
}
