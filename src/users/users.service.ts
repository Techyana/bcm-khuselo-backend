import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '../auth/dto/register.schema';
import { UpdatePasswordDto } from '../auth/dto/update-password.schema';
import { Role } from '../common/enums';
import { PreapprovedUserEntity } from './entities/preapproved-user.entity';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(PreapprovedUserEntity)
    private readonly preapprovedRepo: Repository<PreapprovedUserEntity>,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    const count = await this.preapprovedRepo.count();
    if (count === 0) {
      await this.preapprovedRepo.save([
        {
          name: 'Zuko',
          surname: 'Tetyana',
          email: 'zuko.tetyana@gmail.com',
          rzaNumber: 'ENG-0001',
          role: Role.ENGINEER,
        },
        {
          name: 'Capelanet',
          surname: 'Cyc',
          email: 'capelanet.cyc@gmail.com',
          rzaNumber: 'DISP-0001',
          role: Role.DISPATCHER,
        },
      ]);
    }

    const preapproved = await this.preapprovedRepo.find();
    for (const p of preapproved) {
      if (p.role === Role.ENGINEER || p.role === Role.DISPATCHER) {
        const existing = await this.usersRepo.findOne({ where: { email: p.email } });
        if (!existing) {
          const tempPassword = randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
          const passwordHash = await bcrypt.hash(tempPassword, 10);
          const user = this.usersRepo.create({
            name: p.name,
            surname: p.surname,
            email: p.email,
            rzaNumber: p.rzaNumber,
            role: p.role,
            mustChangePassword: true,
            passwordHash,
          });
          const saved = await this.usersRepo.save(user);
          await this.mailService.sendMail({
            to: saved.email,
            subject: 'Your BCM Khuselo account',
            html: this.mailService.buildWelcomeEmail(saved.name, tempPassword),
          });
        }
      }
    }
  }

  findAll() {
    return this.usersRepo.find();
  }

  findByRole(role: Role) {
    return this.usersRepo.find({ where: { role } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  findPreapproved() {
    return this.preapprovedRepo.find();
  }

  async createPreapproved(dto: { name: string; surname: string; email: string; rzaNumber: string; role: Role }) {
    const existing = await this.preapprovedRepo.findOne({ where: { email: dto.email } });
    if (existing) return existing;
    return this.preapprovedRepo.save(this.preapprovedRepo.create(dto));
  }

  findByEmailWithPassword(email: string) {
    return this.usersRepo.findOne({ where: { email }, select: ['id', 'name', 'surname', 'email', 'role', 'mustChangePassword', 'passwordHash'] });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      ...dto,
      passwordHash,
    });
    return this.usersRepo.save(user);
  }

  async createFromAuth(dto: RegisterDto & { mustChangePassword?: boolean }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      ...dto,
      role: dto.role ?? undefined,
      mustChangePassword: dto.mustChangePassword ?? true,
      passwordHash,
    });
    return this.usersRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.usersRepo.update(id, dto);
    return this.usersRepo.findOne({ where: { id } });
  }

  async updatePassword(userId: string | undefined, dto: UpdatePasswordDto) {
    if (!userId) return null;
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: ['id', 'role', 'passwordHash', 'mustChangePassword', 'name'],
    });
    if (!user) return null;

    if (dto.passwordCurrent) {
      const ok = await bcrypt.compare(dto.passwordCurrent, user.passwordHash);
      if (!ok) return null;
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    user.mustChangePassword = false;
    await this.usersRepo.save(user);
    return this.findById(userId);
  }

  async setPasswordById(userId: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    user.passwordHash = await bcrypt.hash(password, 10);
    user.mustChangePassword = false;
    return this.usersRepo.save(user);
  }
}
