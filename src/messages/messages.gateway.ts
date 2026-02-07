import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() body: { requestId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (body?.requestId) {
      client.join(body.requestId);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    body: { requestId: string; senderId: string; senderName?: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const saved = await this.messagesService.create({
      requestId: body.requestId,
      senderId: body.senderId,
      senderName: body.senderName,
      message: body.message,
    });
    client.nsp.to(body.requestId).emit('message', saved);
  }
}
