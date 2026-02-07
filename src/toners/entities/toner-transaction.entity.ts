import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PartTransactionType } from '../../common/enums';
import { TonerEntity } from './toner.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'toner_transactions' })
export class TonerTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TonerEntity, { eager: true })
  toner: TonerEntity;

  @Column()
  tonerId: string;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: PartTransactionType })
  type: PartTransactionType;

  @Column({ type: 'int' })
  quantityDelta: number;

  @CreateDateColumn()
  createdAt: Date;
}
