import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceRequestStatus } from '../../common/enums';
import { RequestEntity } from './request.entity';

@Entity({ name: 'service_request_updates' })
export class RequestUpdateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RequestEntity, (request) => request.updates, { onDelete: 'CASCADE' })
  request: RequestEntity;

  @Column()
  requestId: string;

  @Column({ type: 'enum', enum: ServiceRequestStatus })
  status: ServiceRequestStatus;

  @Column()
  comment: string;

  @Column({ nullable: true })
  technicianName?: string;

  @Column({ type: 'jsonb', nullable: true })
  gps?: { latitude: number; longitude: number };

  @Column({ nullable: true })
  eta?: string;

  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @CreateDateColumn()
  timestamp: Date;
}
