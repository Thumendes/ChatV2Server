import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageService } from 'src/services/message/message.service';
import { RoomService } from 'src/services/room/room.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/services/utils/utils.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    PrismaService,
    MessageService,
    RoomService,
    ChatGateway,
    UserService,
    UtilsService,
  ],
})
export class ChatModule {}
