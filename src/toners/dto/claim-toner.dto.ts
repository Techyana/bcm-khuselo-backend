import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ClaimTonerDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  claimedBy: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;
}
