import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  QuoteStatus,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestType,
} from '../../common/enums';
import { UserEntity } from '../../users/entities/user.entity';
import { RequestUpdateEntity } from './request-update.entity';

@Entity({ name: 'service_requests' })
export class RequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ServiceRequestType })
  type: ServiceRequestType;

  @Column({ type: 'enum', enum: ServiceRequestStatus, default: ServiceRequestStatus.NEW })
  status: ServiceRequestStatus;

  @Column({ type: 'enum', enum: ServiceRequestPriority })
  priority: ServiceRequestPriority;

  @ManyToOne(() => UserEntity, { eager: false })
  customer: UserEntity;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  customerAddress?: string;

  @Column({ default: false })
  isPriorityClient: boolean;

  @Column({ default: false })
  customerCreditHold: boolean;

  @Column({ default: false })
  requiresQuote: boolean;

  @Column({ default: false })
  hasQuote: boolean;

  @Column({ nullable: true })
  quoteId?: string;

  @Column({ type: 'enum', enum: QuoteStatus, nullable: true })
  quoteStatus?: QuoteStatus;

  @ManyToOne(() => UserEntity, { eager: false, nullable: true })
  assignedEngineer?: UserEntity;

  @Column({ nullable: true })
  assignedEngineerId?: string;

  @ManyToOne(() => UserEntity, { eager: false, nullable: true })
  dispatcher?: UserEntity;

  @Column({ nullable: true })
  dispatcherId?: string;

  @Column({ nullable: true })
  assignedTechnicianName?: string;

  @Column({ nullable: true })
  assignedAt?: Date;

  @Column({ nullable: true })
  dispatcherAssignedAt?: Date;

  @Column({ nullable: true })
  acknowledgedAt?: Date;

  @Column({ nullable: true })
  enRouteAt?: Date;

  @Column({ nullable: true })
  onSiteAt?: Date;

  @Column({ nullable: true })
  waitingPartsAt?: Date;

  @Column({ nullable: true })
  waitingCustomerAt?: Date;

  @Column({ type: 'jsonb' })
  requestDetails: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  partsOrdered?: Array<{
    partName: string;
    partNumber: string;
    orderedAt: string;
    expectedDelivery: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  quoteRequestedAt?: Date;

  @Column({ nullable: true })
  quoteSentAt?: Date;

  @Column({ nullable: true })
  quoteAcceptedAt?: Date;

  @Column({ nullable: true })
  quoteRejectedAt?: Date;

  @OneToMany(() => RequestUpdateEntity, (update) => update.request, { cascade: true })
  updates: RequestUpdateEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
