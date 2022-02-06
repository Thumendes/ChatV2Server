import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/services/prisma/prisma.service';

export const User = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const db = PrismaService.instance;
    const token = request.headers.authorization;

    if (!token)
      throw new HttpException(
        { success: false, msg: 'Usuário precisa estar autenticado!' },
        401,
      );

    const user = await db.user.findFirst({ where: { token } });

    if (!user)
      throw new HttpException(
        { success: false, msg: 'Usuário não encontrado!' },
        401,
      );

    return user;
  },
);
