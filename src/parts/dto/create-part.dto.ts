import { IsArray, IsInt, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsString()
  partNumber: string;

  @IsArray()
  forDeviceModels: string[];

  @IsInt()
  @Min(1)
  quantity: number;
}
