import { IsOptional, IsString } from 'class-validator';

export class AssignRequestDto {
  @IsString()
  engineerId: string;

  @IsOptional()
  @IsString()
  dispatcherId?: string;
}
