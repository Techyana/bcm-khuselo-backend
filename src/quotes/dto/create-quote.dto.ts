import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QuoteStatus } from '../../common/enums';

export class CreateQuoteDto {
  @IsString()
  requestId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
