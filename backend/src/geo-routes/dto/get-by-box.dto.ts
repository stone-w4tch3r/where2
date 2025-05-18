import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetByBoxDto {
  @ApiProperty({
    description: "Minimum latitude of the bounding box",
    example: 40.7,
  })
  @IsNumber()
  @IsNotEmpty()
  minLatitude!: number;

  @ApiProperty({
    description: "Minimum longitude of the bounding box",
    example: -74.0,
  })
  @IsNumber()
  @IsNotEmpty()
  minLongitude!: number;

  @ApiProperty({
    description: "Maximum latitude of the bounding box",
    example: 40.72,
  })
  @IsNumber()
  @IsNotEmpty()
  maxLatitude!: number;

  @ApiProperty({
    description: "Maximum longitude of the bounding box",
    example: -73.98,
  })
  @IsNumber()
  @IsNotEmpty()
  maxLongitude!: number;
}
