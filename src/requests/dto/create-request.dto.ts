import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ServiceRequestPriority, ServiceRequestType } from '../../common/enums';

export class CreateRequestDto {
  @IsEnum(ServiceRequestType)
  type: ServiceRequestType;

  @IsOptional()
  @IsEnum(ServiceRequestPriority)
  priority?: ServiceRequestPriority;

  @IsString()
  customerId: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsBoolean()
  isPriorityClient?: boolean;

  @IsOptional()
  @IsBoolean()
  customerCreditHold?: boolean;

  @IsObject()
  requestDetails: Record<string, unknown>;
}
