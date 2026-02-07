import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  requestId: string;

  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsString()
  message: string;
}
