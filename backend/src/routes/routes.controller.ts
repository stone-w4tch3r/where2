import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RoutesService } from "./routes.service";
import { AppError } from "../utils/errors";

@ApiTags("routes")
@Controller("routes")
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @ApiOperation({ summary: "Get all routes" })
  @ApiResponse({ status: 200, description: "Returns all routes" })
  @Get()
  async findAll() {
    return this.routesService.findAll();
  }

  @ApiOperation({ summary: "Get route by ID" })
  @ApiParam({ name: "id", description: "Route ID" })
  @ApiResponse({ status: 200, description: "Returns the route" })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.routesService.findOne(id);
    if (result.success) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  @ApiOperation({ summary: "Get routes by station ID" })
  @ApiParam({ name: "stationId", description: "Station ID" })
  @ApiResponse({ status: 200, description: "Returns routes for the station" })
  @Get("by-station/:stationId")
  async findByStation(@Param("stationId") stationId: string) {
    return this.routesService.findByStation(stationId);
  }
}
