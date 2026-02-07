import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from '../../common/enums';

export class CreatePreapprovedUserDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsEmail()
  email: string;

  @IsString()
  rzaNumber: string;

  @IsEnum(Role)
  role: Role;
}
