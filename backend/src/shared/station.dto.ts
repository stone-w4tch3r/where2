import { ApiProperty } from "@nestjs/swagger/dist";
import { TransportMode } from "./transport-mode.dto";
import { Station } from "../prisma/models";

export class StationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: TransportMode })
  transportMode: TransportMode;

  @ApiProperty({ type: Number, nullable: true })
  latitude: number | null;

  @ApiProperty({ type: Number, nullable: true })
  longitude: number | null;

  @ApiProperty({ type: String, nullable: true })
  country: string | null;

  @ApiProperty({ type: String, nullable: true })
  region: string | null;

  constructor(station: Station) {
    this.id = station.id;
    this.fullName = station.fullName;
    this.transportMode = station.transportMode;
    this.latitude = station.latitude;
    this.longitude = station.longitude;
    this.country = station.country;
    this.region = station.region;
  }
}
