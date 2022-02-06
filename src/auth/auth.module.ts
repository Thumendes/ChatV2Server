import { Module } from '@nestjs/common';
import { UtilsService } from 'src/services/utils/utils.service';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  providers: [AuthService, UtilsService],
  exports: [AuthService],
})
export class AuthModule {}
