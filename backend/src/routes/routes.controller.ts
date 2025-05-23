import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
} from "@nestjs/swagger";
import { RoutesService } from "./routes.service";
import { RouteFilterDto } from "./route-filter.dto";
import { RouteDto } from "../shared/route.dto";

@ApiTags("routes")
@Controller("routes")
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @ApiOperation({ summary: "Get all routes" })
  @ApiOkResponse({ type: RouteDto, isArray: true })
  @Get()
  async findAll(@Query() filter: RouteFilterDto): Promise<RouteDto[]> {
    const result = await this.routesService.findAll(filter);
    if (!result.success) throw result.error;
    return result.data.map((route) => new RouteDto(route));
  }

  @ApiOperation({ summary: "Get route by ID" })
  @ApiParam({ name: "id", description: "Route ID" })
  @ApiOkResponse({ type: RouteDto })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<RouteDto> {
    const result = await this.routesService.findOne(id);
    if (!result.success) throw result.error;
    if (!result.data) throw new NotFoundException(`Route not found: ${id}`);
    return new RouteDto(result.data);
  }

  @ApiOperation({ summary: "Get routes by station ID" })
  @ApiParam({ name: "stationId", description: "Station ID" })
  @ApiOkResponse({ type: RouteDto, isArray: true })
  @Get("by-station/:stationId")
  async findByStation(
    @Param("stationId") stationId: string,
  ): Promise<RouteDto[]> {
    const result = await this.routesService.findByStation(stationId);
    if (!result.success) throw result.error;
    return result.data.map((route) => new RouteDto(route));
  }
}
