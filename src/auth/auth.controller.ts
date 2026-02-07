import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from './dto/login.schema';
import { registerSchema } from './dto/register.schema';
import { updatePasswordSchema } from './dto/update-password.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions() {
    const secure =
      process.env.COOKIE_SECURE === 'true' ||
      process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 900 } })
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = loginSchema.parse(body);
    const result = await this.authService.login(dto.email, dto.password);
    res.cookie('auth', result.token, this.getCookieOptions());
    return { message: 'Login successful', user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user?: { userId?: string } }) {
    return this.authService.getMe(req.user?.userId);
  }

  @Post('register')
  async register(@Body() body: unknown) {
    const dto = registerSchema.parse(body);
    return this.authService.register(dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 900 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 900 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Req() req: { user?: { userId?: string } },
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = updatePasswordSchema.parse(body);
    const result = await this.authService.updatePassword(req.user?.userId, dto);
    res.cookie('auth', result.token, this.getCookieOptions());
    return { message: 'Password updated', user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth', this.getCookieOptions());
    return { message: 'Logged out' };
  }
}
