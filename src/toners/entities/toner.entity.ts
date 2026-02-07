import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartStatus, TonerColor } from '../../common/enums';

@Entity({ name: 'toners' })
export class TonerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column()
  edpCode: string;

  @Column({ type: 'enum', enum: TonerColor })
  color: TonerColor;

  @Column({ type: 'int', nullable: true })
  yield?: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'text', array: true, nullable: true })
  forDeviceModels?: string[];

  @Column()
  from: string;

  @Column({ nullable: true })
  claimedByName?: string;

  @Column({ nullable: true })
  claimedAt?: Date;

  @Column({ default: false })
  collected?: boolean;

  @Column({ nullable: true })
  collectedByName?: string;

  @Column({ nullable: true })
  collectedAt?: Date;

  @Column({ nullable: true })
  requestedByName?: string;

  @Column({ nullable: true })
  requestedAtTimestamp?: Date;

  @Column({ nullable: true })
  partNumber?: string;

  @Column({ type: 'enum', enum: PartStatus, nullable: true })
  status?: PartStatus;

  @Column({ nullable: true })
  serialNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
