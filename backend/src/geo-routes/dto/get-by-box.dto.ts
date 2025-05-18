import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetByBoxDto {
  @ApiProperty({
    description: "Minimum latitude of the bounding box",
    example: 40.7,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  minLatitude!: number;

  @ApiProperty({
    description: "Minimum longitude of the bounding box",
    example: -74.0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  minLongitude!: number;

  @ApiProperty({
    description: "Maximum latitude of the bounding box",
    example: 40.72,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  maxLatitude!: number;

  @ApiProperty({
    description: "Maximum longitude of the bounding box",
    example: -73.98,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  maxLongitude!: number;
}
