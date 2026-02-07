import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.schema';
import { UpdatePasswordDto } from './dto/update-password.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetEntity)
    private readonly resetRepo: Repository<PasswordResetEntity>,
    private readonly mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    const fullUser = await this.usersService.findById(user.id);
    return {
      token,
      user: fullUser ?? {
        id: user.id,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== 'CUSTOMER') {
      const preapproved = await this.usersService.findPreapproved();
      const isApproved = preapproved.some((p) => p.email.toLowerCase() === dto.email.toLowerCase());
      if (!isApproved) {
        throw new UnauthorizedException('Not pre-approved');
      }
    }

    const created = await this.usersService.createFromAuth({
      ...dto,
      mustChangePassword: dto.role && dto.role !== 'CUSTOMER' ? true : false,
    } as any);
    await this.mailService.sendMail({
      to: created.email,
      subject: 'Your BCM Khuselo account',
      html: this.mailService.buildWelcomeEmail(created.name, dto.password),
    });
    return created;
  }

  async updatePassword(userId: string | undefined, dto: UpdatePasswordDto) {
    const result = await this.usersService.updatePassword(userId, dto);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: result.id, role: result.role });
    return { token, user: result };
  }

  async getMe(userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing user');
    return this.usersService.findById(userId);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) return { message: 'If the email exists, a reset link was sent.' };

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.resetRepo.save(
      this.resetRepo.create({
        userId: user.id,
        token,
        expiresAt,
      }),
    );

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: this.mailService.buildResetEmail(user.name, resetUrl),
    });

    return { message: 'If the email exists, a reset link was sent.' };
  }

  async resetPassword(dto: { token: string; password: string; passwordConfirm: string }) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const reset = await this.resetRepo.findOne({ where: { token: dto.token } });
    if (!reset || reset.usedAt) throw new BadRequestException('Invalid reset token');
    if (reset.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token expired');
    }

    await this.usersService.setPasswordById(reset.userId, dto.password);
    reset.usedAt = new Date();
    await this.resetRepo.save(reset);

    return { message: 'Password reset successful' };
  }
}
