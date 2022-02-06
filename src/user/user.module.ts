import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UtilsService } from 'src/services/utils/utils.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthService, UtilsService],
  exports: [UserService],
})
export class UserModule {}
