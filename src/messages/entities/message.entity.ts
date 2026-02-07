import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestEntity } from '../../requests/entities/request.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'messages' })
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RequestEntity, { eager: false })
  request: RequestEntity;

  @Column()
  requestId: string;

  @ManyToOne(() => UserEntity, { eager: false })
  sender: UserEntity;

  @Column()
  senderId: string;

  @Column({ nullable: true })
  senderName?: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
