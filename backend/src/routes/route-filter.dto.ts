import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { TransportMode } from "../shared/transport-mode.dto";

export class RouteFilterDto {
  @ApiPropertyOptional({
    description: "Transport mode to filter by",
    enum: TransportMode,
  })
  @IsOptional()
  transportMode?: TransportMode;
}
