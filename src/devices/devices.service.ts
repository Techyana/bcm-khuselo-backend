import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceStatus, DeviceCondition } from '../common/enums';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly devicesRepo: Repository<DeviceEntity>,
  ) {}

  getAll() {
    return this.devicesRepo.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateDeviceDto) {
    const device = this.devicesRepo.create({
      ...dto,
      status: DeviceStatus.APPROVED_FOR_DISPOSAL,
      customerName: 'Unknown',
      condition: DeviceCondition.FAIR,
      comments: 'Newly added device.',
      strippedParts: [],
    });
    return this.devicesRepo.save(device);
  }

  async remove(id: string, reason: string) {
    const device = await this.devicesRepo.findOne({ where: { id } });
    if (!device) throw new NotFoundException('Device not found');
    device.status = DeviceStatus.REMOVED;
    device.removalReason = reason;
    return this.devicesRepo.save(device);
  }
}
