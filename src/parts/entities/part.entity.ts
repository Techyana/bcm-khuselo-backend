import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartStatus } from '../../common/enums';

@Entity({ name: 'parts' })
export class PartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  partNumber: string;

  @Column({ type: 'enum', enum: PartStatus })
  status: PartStatus;

  @Column({ nullable: true })
  claimedByName?: string;

  @Column({ nullable: true })
  claimedAt?: Date;

  @Column({ nullable: true })
  collectedAt?: Date;

  @Column({ nullable: true })
  requestedByName?: string;

  @Column({ nullable: true })
  requestedAtTimestamp?: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  availableQuantity: number;

  @Column({ type: 'text', array: true, default: '{}' })
  forDeviceModels: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
