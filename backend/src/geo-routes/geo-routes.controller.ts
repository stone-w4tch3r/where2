import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { GeoRoutesService } from "./geo-routes.service";
import { GetByRadiusDto } from "./dto/get-by-radius.dto";
import { GetByBoxDto } from "./dto/get-by-box.dto";
import { ResultUnwrapInterceptor } from "../utils/result-unwrap.interceptor";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RouteDto } from "../shared/route.dto";

@ApiTags("geo-routes")
@UseInterceptors(ResultUnwrapInterceptor)
@Controller("geo-routes")
export class GeoRoutesController {
  constructor(private readonly geoRoutesService: GeoRoutesService) {}

  @Get("by-radius")
  @ApiOperation({ summary: "Get routes by radius from a central point" })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved routes.",
    type: [RouteDto],
  })
  @ApiResponse({ status: 400, description: "Invalid input parameters." })
  async getByRadius(
    @Query() getByRadiusDto: GetByRadiusDto,
  ): Promise<RouteDto[]> {
    const result = await this.geoRoutesService.getByRadius(getByRadiusDto);
    if (!result.success) throw result.error;
    return result.data.map((route) => new RouteDto(route));
  }

  @Get("by-coordinate-box")
  @ApiOperation({
    summary: "Get routes within a specified coordinate bounding box",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved routes.",
    type: [RouteDto],
  })
  @ApiResponse({ status: 400, description: "Invalid input parameters." })
  async getByCoordinateBox(
    @Query() getByBoxDto: GetByBoxDto,
  ): Promise<RouteDto[]> {
    const result = await this.geoRoutesService.getByCoordinateBox(getByBoxDto);
    if (!result.success) throw result.error;
    return result.data.map((route) => new RouteDto(route));
  }
}
