import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './services/prisma/prisma.service';
import { UserModule } from './user/user.module';
import { RoomService } from './services/room/room.service';
import { MessageService } from './services/message/message.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { CryptService } from './services/crypt/crypt.service';
import { UtilsService } from './services/utils/utils.service';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    UserModule,
    ChatModule,
    AuthModule,
    MorganModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    RoomService,
    MessageService,
    CryptService,
    UtilsService,
    { provide: APP_INTERCEPTOR, useClass: MorganInterceptor('dev') },
  ],
})
export class AppModule {}
