import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { TransportMode } from "../../shared/dto/transport-mode.dto";

export class UpdateRouteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, enum: TransportMode })
  @IsOptional()
  @IsEnum(TransportMode)
  transportType?: TransportMode;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stops?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  routeInfoUrl?: string;
}
