import { IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  model: string;

  @IsString()
  serialNumber: string;
}
