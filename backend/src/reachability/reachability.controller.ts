import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  ReachabilityService,
  ReachabilityResult,
} from "./reachability.service";
import { ReachabilityQueryDto } from "./dto/reachability-query.dto";
import { Result } from "../utils/Result";
import { AppError } from "../utils/errors";

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
    type: Object,
  })
  @Get()
  async getReachableStations(
    @Query() query: ReachabilityQueryDto,
  ): Promise<Result<ReachabilityResult, AppError>> {
    return this.reachabilityService.calculateReachableStations(
      query.stationId,
      query.maxTransfers,
    );
  }
}
