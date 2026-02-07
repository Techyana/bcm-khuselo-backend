import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceCondition, DeviceStatus } from '../../common/enums';

@Entity({ name: 'devices' })
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column()
  serialNumber: string;

  @Column({ type: 'enum', enum: DeviceStatus })
  status: DeviceStatus;

  @Column()
  customerName: string;

  @Column({ type: 'enum', enum: DeviceCondition })
  condition: DeviceCondition;

  @Column({ type: 'text' })
  comments: string;

  @Column({ type: 'jsonb', default: '[]' })
  strippedParts: Array<{ partId: string; partName: string; strippedAt: string }>;

  @Column({ nullable: true })
  removalReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
