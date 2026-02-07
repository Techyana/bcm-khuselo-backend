import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TonerColor } from '../../common/enums';

export class CreateTonerDto {
  @IsString()
  model: string;

  @IsString()
  edpCode: string;

  @IsEnum(TonerColor)
  color: TonerColor;

  @IsOptional()
  @IsInt()
  yield?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsArray()
  forDeviceModels?: string[];

  @IsString()
  from: string;
}
