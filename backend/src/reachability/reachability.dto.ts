import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { RouteDto } from "../routes/routes.controller";
import { TransportMode } from "../shared/dto/transport-mode.dto";
import { Station, Route } from "../prisma/models";

export class ReachabilityQueryDto {
  @ApiProperty({ description: "Origin station ID" })
  @IsNotEmpty()
  @IsString()
  stationId!: string;

  @ApiProperty({
    description: "Maximum number of transfers",
    default: 1,
    minimum: 0,
    maximum: 3,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3)
  @Type(() => Number)
  maxTransfers = 1;
}

export class StationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: TransportMode })
  transportMode: TransportMode;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty({ nullable: true })
  country: string | null;

  @ApiProperty({ nullable: true })
  region: string | null;

  constructor(station: Station) {
    this.id = station.id;
    this.fullName = station.fullName;
    this.transportMode = station.transportMode as TransportMode;
    this.latitude = station.latitude;
    this.longitude = station.longitude;
    this.country = station.country;
    this.region = station.region;
  }
}

export class ReachableStationDto {
  @ApiProperty({ type: StationDto })
  station: StationDto;

  @ApiProperty()
  transferCount: number;

  @ApiProperty({ type: [RouteDto] })
  routes: RouteDto[];

  constructor(data: {
    station: Station;
    transferCount: number;
    routes: Route[];
  }) {
    this.station = new StationDto(data.station);
    this.transferCount = data.transferCount;
    this.routes = data.routes.map(
      (route) =>
        new RouteDto({
          ...route,
          transportMode: route.transportMode as TransportMode,
        }),
    );
  }
}

export class ReachabilityResultDto {
  @ApiProperty()
  origin: string;

  @ApiProperty()
  maxTransfers: number;

  @ApiProperty({ type: [ReachableStationDto] })
  reachableStations: ReachableStationDto[];

  constructor(data: {
    origin: string;
    maxTransfers: number;
    reachableStations: {
      station: Station;
      transferCount: number;
      routes: Route[];
    }[];
  }) {
    this.origin = data.origin;
    this.maxTransfers = data.maxTransfers;
    this.reachableStations = data.reachableStations.map(
      (rs) => new ReachableStationDto(rs),
    );
  }
}
