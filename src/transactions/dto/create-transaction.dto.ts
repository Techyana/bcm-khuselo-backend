import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsOptional()
  @IsUUID()
  partId?: string;

  @IsOptional()
  @IsUUID()
  tonerId?: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  quantityDelta?: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsInt()
  monoTotal?: number;

  @IsOptional()
  @IsInt()
  colorTotal?: number;

}
