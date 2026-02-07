import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CollectTonerDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  collectedBy: string;
}
