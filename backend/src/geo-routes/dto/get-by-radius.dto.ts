import { IsNotEmpty, IsNumber } from "class-validator";

export class GetByRadiusDto {
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @IsNumber()
  @IsNotEmpty()
  radius!: number; // Assuming radius is in kilometers
}
