import { IsString } from 'class-validator';

export class RemovePartDto {
  @IsString()
  reason: string;
}
