import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  private logger = new Logger();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { authorization: token } = request.headers;

    if (!token) {
      this.logger.error('O usuário não está autenticado!');
      throw new HttpException(
        { success: false, msg: 'Usuário não autenticado!' },
        403,
      );
    }

    const user = await this.auth.validateToken(token);

    if (!user) return false;

    return true;
  }
}
