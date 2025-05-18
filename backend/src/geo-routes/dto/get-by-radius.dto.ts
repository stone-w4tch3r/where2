import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetByRadiusDto {
  @ApiProperty({
    description: "Latitude of the center point",
    example: 40.7128,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({
    description: "Longitude of the center point",
    example: -74.006,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @ApiProperty({ description: "Radius in kilometers", example: 5 })
  @IsNumber()
  @IsNotEmpty()
  radius!: number; // Assuming radius is in kilometers
}
