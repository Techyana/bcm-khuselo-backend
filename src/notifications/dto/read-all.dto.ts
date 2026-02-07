import { IsString } from 'class-validator';

export class ReadAllNotificationsDto {
  @IsString()
  userId: string;
}
