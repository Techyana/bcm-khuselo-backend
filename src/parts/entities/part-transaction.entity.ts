import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PartTransactionType } from '../../common/enums';
import { PartEntity } from './part.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'part_transactions' })
export class PartTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PartEntity, { eager: true })
  part: PartEntity;

  @Column()
  partId: string;

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
