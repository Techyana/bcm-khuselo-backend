import { IsString } from 'class-validator';

export class RemoveDeviceDto {
  @IsString()
  reason: string;
}
