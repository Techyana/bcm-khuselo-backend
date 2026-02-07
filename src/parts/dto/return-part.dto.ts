import { IsString } from 'class-validator';

export class ReturnPartDto {
  @IsString()
  reason: string;
}
