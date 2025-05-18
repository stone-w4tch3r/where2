import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { TransportMode } from "../../shared/dto/transport-mode.dto";

export class StationFilterDto {
  @ApiPropertyOptional({ description: "Country to filter by" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: "Region to filter by" })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: "Minimum latitude of the rectangle" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLat?: number;

  @ApiPropertyOptional({ description: "Maximum latitude of the rectangle" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLat?: number;

  @ApiPropertyOptional({ description: "Minimum longitude of the rectangle" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLon?: number;

  @ApiPropertyOptional({ description: "Maximum longitude of the rectangle" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLon?: number;

  @ApiPropertyOptional({
    description: "Transport mode to filter by",
    enum: TransportMode,
  })
  @IsOptional()
  transportMode?: TransportMode;
}
