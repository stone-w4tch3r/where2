import { ApiProperty } from "@nestjs/swagger/dist";
import { TransportMode } from "../shared/transport-mode.dto";

export class RouteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shortTitle: string;

  @ApiProperty()
  fullTitle: string;

  @ApiProperty({ enum: TransportMode })
  transportMode: TransportMode;

  @ApiProperty({ type: String, required: false, nullable: true })
  routeInfoUrl: string | null;

  constructor(route: {
    id: string;
    shortTitle: string;
    fullTitle: string;
    transportMode: TransportMode;
    routeInfoUrl: string | null;
  }) {
    this.id = route.id;
    this.shortTitle = route.shortTitle;
    this.fullTitle = route.fullTitle;
    this.transportMode = route.transportMode;
    this.routeInfoUrl = route.routeInfoUrl;
  }
}
