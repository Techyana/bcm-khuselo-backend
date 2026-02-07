import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuoteStatus } from '../../common/enums';
import { RequestEntity } from '../../requests/entities/request.entity';

@Entity({ name: 'quotes' })
export class QuoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RequestEntity, { eager: false })
  request: RequestEntity;

  @Column()
  requestId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'ZAR' })
  currency: string;

  @Column({ type: 'enum', enum: QuoteStatus })
  status: QuoteStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @CreateDateColumn()
  issuedAt: Date;
}
