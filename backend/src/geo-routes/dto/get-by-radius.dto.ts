import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetByRadiusDto {
  @ApiProperty({
    description: "Latitude of the center point",
    example: 56.83,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({
    description: "Longitude of the center point",
    example: 60.6,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @ApiProperty({ description: "Radius in kilometers", example: 5 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  radius!: number; // Assuming radius is in kilometers
}
