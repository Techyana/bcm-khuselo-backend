import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { RemoveDeviceDto } from './dto/remove-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAll() {
    return this.devicesService.getAll();
  }

  @Post()
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() dto: RemoveDeviceDto) {
    return this.devicesService.remove(id, dto.reason);
  }
}
