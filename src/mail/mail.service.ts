import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.init();
  }

  private init() {
    const host = this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!user || !pass) {
      this.logger.warn('SMTP credentials missing. Email sending is disabled.');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private from() {
    return this.config.get<string>('SMTP_FROM') || 'BCM Khuselo <no-reply@bcmkhuselo.co.za>';
  }

  async sendMail(options: { to: string; subject: string; html: string }) {
    if (!this.transporter) return;
    await this.transporter.sendMail({
      from: this.from(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  buildBaseTemplate(title: string, body: string) {
    return `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
          <h2 style="margin:0 0 12px;color:#111827;">${title}</h2>
          <div style="color:#374151;font-size:14px;line-height:1.6;">${body}</div>
          <div style="margin-top:24px;color:#9ca3af;font-size:12px;text-align:center;">© 2026 BCM Khuselo</div>
        </div>
      </div>
    `;
  }

  buildWelcomeEmail(name: string, tempPassword: string) {
    const body = `
      <p>Hello ${name},</p>
      <p>Your account has been created. Use the temporary password below to log in:</p>
      <p style="font-size:18px;font-weight:bold;letter-spacing:1px;">${tempPassword}</p>
      <p>You will be prompted to change your password on first login.</p>
    `;
    return this.buildBaseTemplate('Welcome to BCM Khuselo', body);
  }

  buildResetEmail(name: string, resetUrl: string) {
    const body = `
      <p>Hello ${name},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px;">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;
    return this.buildBaseTemplate('Reset Your Password', body);
  }

  buildNotificationEmail(title: string, message: string) {
    const body = `<p>${message}</p>`;
    return this.buildBaseTemplate(title, body);
  }
}
