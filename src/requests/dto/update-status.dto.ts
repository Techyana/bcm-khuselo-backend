import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServiceRequestStatus } from '../../common/enums';

export class UpdateStatusDto {
  @IsEnum(ServiceRequestStatus)
  status: ServiceRequestStatus;

  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  technicianName?: string;
}
