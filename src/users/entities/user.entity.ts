import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  surname: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 50 })
  rzaNumber: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({ default: false })
  creditHold: boolean;

  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
