import { ApiProperty } from "@nestjs/swagger/dist";
import { TransportMode } from "../shared/transport-mode.dto";
import { RouteWithStops } from "../prisma/models";
import { StationDto } from "../shared/station.dto";

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

  @ApiProperty({ type: () => StationDto, isArray: true })
  stops: StationDto[];

  constructor(route: RouteWithStops) {
    this.id = route.id;
    this.shortTitle = route.shortTitle;
    this.fullTitle = route.fullTitle;
    this.transportMode = route.transportMode;
    this.routeInfoUrl = route.routeInfoUrl;
    this.stops = route.stops
      .sort((a, b) => a.stopPosition - b.stopPosition)
      .map((stop) => new StationDto(stop.station));
  }
}
