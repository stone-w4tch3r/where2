import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  ReachabilityService,
  ReachabilityResult,
} from "./reachability.service";
import {
  ReachabilityQueryDto,
  ReachabilityResultDto,
} from "./reachability.dto";
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
    type: ReachabilityResultDto,
  })
  @Get()
  async getReachableStations(
    @Query() query: ReachabilityQueryDto,
  ): Promise<ReachabilityResultDto> {
    const result = await this.reachabilityService.calculateReachableStations(
      query.stationId,
      query.maxTransfers,
    );
    if (!result.success) throw result.error;
    return new ReachabilityResultDto(result.data);
  }
}
