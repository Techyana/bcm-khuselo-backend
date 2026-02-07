import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ReadAllNotificationsDto } from './dto/read-all.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getByUser(@Query('userId') userId: string) {
    return this.notificationsService.getByUser(userId);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Post('read-all')
  markAll(@Body() dto: ReadAllNotificationsDto) {
    return this.notificationsService.markAll(dto.userId);
  }
}
