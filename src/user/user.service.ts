import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private db: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const userExists = await this.db.user.findFirst({
      where: { email: data.email },
    });

    if (userExists) {
      throw new HttpException(
        { success: false, msg: 'Já existe usuário com este email!' },
        400,
      );
    }

    return await this.db.user.create({ data });
  }

  async findAll(filter?: Prisma.UserFindManyArgs) {
    return await this.db.user.findMany({
      ...filter,
      select: filter?.select || {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return await this.db.user.findFirst({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.db.user.findFirst({ where: { email } });
  }

  async findByToken(token: string) {
    return await this.db.user.findFirst({ where: { token } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.db.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return await this.db.user.delete({ where: { id } });
  }
}
