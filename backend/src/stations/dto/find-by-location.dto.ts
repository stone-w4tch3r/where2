import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class FindByLocationDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  latitude!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  longitude!: number;

  @ApiProperty({ type: Number, required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius = 5;
}
