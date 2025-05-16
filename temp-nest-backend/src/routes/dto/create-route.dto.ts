import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { TransportMode } from "@prisma/client";

export class CreateRouteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ enum: TransportMode })
  @IsEnum(TransportMode)
  transportType: TransportMode;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  stops: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  routeInfoUrl?: string;
}
