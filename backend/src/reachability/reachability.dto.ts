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
import { Station, Route } from "../prisma/models";
import { StationDto } from "../shared/station.dto";

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

export class ReachabilityResultDto {
  @ApiProperty()
  origin: string;

  @ApiProperty()
  maxTransfers: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ type: [StationDto] })
  reachableStations: StationDto[];

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
    this.totalCount = data.reachableStations.length;
    this.reachableStations = data.reachableStations.map(
      (rs) => new StationDto(rs.station),
    );
  }
}
