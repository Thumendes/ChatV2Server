import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AttachmentType, User } from '@prisma/client';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import { Cache } from 'cache-manager';

interface SendMessagePayload {
  text: string;
  date: Date;
  roomId: string;
  senderId: string;
  attachment?: {
    url: string;
    type: AttachmentType;
  };
}

@WebSocketGateway({ cors: true })
export class ChatGateway {
  private logger = new Logger('ChatGateway');

  constructor(
    private chat: ChatService,
    private user: UserService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const message = await this.chat.createMessage({
      text: payload.text,
      date: payload.date,
      room: { connect: { id: payload.roomId } },
      sender: { connect: { id: payload.senderId } },
      attachment: payload.attachment
        ? { create: payload.attachment }
        : undefined,
    });

    this.logger.log(`Nova mensagem de ${socket.id}`);
    this.logger.debug(message);

    socket.to(payload.roomId).emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { code, userId }: { code: string; userId: string },
  ) {
    this.logger.log(`${socket.id} (${userId}) entrou na sala ${code}`);
    const room = await this.chat.findRoomByCode(code);

    if (!room) return { success: false, msg: 'Não existe essa sala!' };

    const user = await this.user.findById(userId);

    const userAlredyInRoom = room.users.find((user) => user.userId === userId);

    if (!userAlredyInRoom) await this.chat.addUserToRoom(userId, room.id);

    socket.join(room.id);

    await this.cache.set(socket.id, user);

    socket.to(room.id).emit('userJoined', user);

    return { success: true, msg: 'Entrou na sala!', data: room };
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: string,
  ) {
    socket.leave(roomId);

    const user = await this.cache.get<User>(socket.id);
    await this.cache.del(socket.id);

    socket.to(roomId).emit('userLeft', user);

    return { success: true, msg: 'Saiu da sala!' };
  }
}
