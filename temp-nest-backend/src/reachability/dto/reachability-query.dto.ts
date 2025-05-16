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
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3)
  @Type(() => Number)
  maxTransfers: number = 1;
}
