import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messagesRepo: Repository<MessageEntity>,
  ) {}

  getByRequest(requestId: string) {
    return this.messagesRepo.find({
      where: { requestId },
      order: { createdAt: 'ASC' },
    });
  }

  create(dto: CreateMessageDto) {
    const message = this.messagesRepo.create(dto);
    return this.messagesRepo.save(message);
  }
}
