import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TransportMode } from "../../shared/dto/transport-mode.dto";

export class UpdateStationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  popularName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ required: false, enum: TransportMode })
  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;
}
