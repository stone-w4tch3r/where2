import { IsNotEmpty, IsNumber } from "class-validator";

export class GetByBoxDto {
  @IsNumber()
  @IsNotEmpty()
  minLatitude!: number;

  @IsNumber()
  @IsNotEmpty()
  minLongitude!: number;

  @IsNumber()
  @IsNotEmpty()
  maxLatitude!: number;

  @IsNumber()
  @IsNotEmpty()
  maxLongitude!: number;
}
