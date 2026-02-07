import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationType } from '../common/enums';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepo: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async createNotification(input: {
    userId: string;
    type: NotificationType;
    message: string;
    metadata?: { partId?: string; shipmentNumber?: string; requestId?: string };
  }) {
    const notification = this.notificationsRepo.create({
      userId: input.userId,
      type: input.type,
      message: input.message,
      metadata: input.metadata,
    });
    const saved = await this.notificationsRepo.save(notification);
    this.notificationsGateway.emitToUser(input.userId, saved);

    if (process.env.MAIL_NOTIFICATIONS === 'true') {
      const user = await this.usersService.findById(input.userId);
      if (user?.email) {
        await this.mailService.sendMail({
          to: user.email,
          subject: 'BCM Khuselo Notification',
          html: this.mailService.buildNotificationEmail('Notification', input.message),
        });
      }
    }
    return saved;
  }

  getByUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async markRead(id: string) {
    const notif = await this.notificationsRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.isRead = true;
    return this.notificationsRepo.save(notif);
  }

  async markAll(userId: string) {
    const list = await this.notificationsRepo.find({ where: { userId } });
    list.forEach((n) => (n.isRead = true));
    return this.notificationsRepo.save(list);
  }
}
