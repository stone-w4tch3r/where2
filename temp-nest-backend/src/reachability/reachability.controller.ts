import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReachabilityService } from "./reachability.service";
import { ReachabilityQueryDto } from "./dto/reachability-query.dto";

@ApiTags("reachability")
@Controller("reachability")
export class ReachabilityController {
  constructor(private readonly reachabilityService: ReachabilityService) {}

  @ApiOperation({
    summary: "Get reachable stations from a given station with max transfers",
  })
  @ApiResponse({
    status: 200,
    description: "Returns reachable stations from the specified origin",
  })
  @Get()
  async getReachableStations(@Query() query: ReachabilityQueryDto) {
    try {
      return await this.reachabilityService.calculateReachableStations(
        query.stationId,
        query.maxTransfers
      );
    } catch (error) {
      throw error;
    }
  }
}
