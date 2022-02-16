import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  UseGuards,
  HttpException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UtilsService } from 'src/services/utils/utils.service';

@Controller('user')
export class UserController {
  constructor(private readonly users: UserService, private auth: AuthService) {}

  @Post()
  async create(@Body() data: Prisma.UserCreateInput) {
    return await this.users.create(data);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return await this.users.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.users.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
    return await this.users.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.users.remove(id);
  }

  @Post('token')
  async getUserByToken(@Body() { token }: { token: string }) {
    return await this.users.findByToken(token);
  }

  @Post('login')
  async login(@Body() data: Pick<User, 'email' | 'password'>) {
    const validate = await this.auth.validateUser(data.email, data.password);

    if (validate.success === false) {
      throw new HttpException({ success: false, msg: validate.msg }, 401);
    }

    return validate;
  }

  @Post('signout')
  async signOut(@Body() { token }: { token: string }) {
    const user = await this.users.findByToken(token);

    if (!user)
      throw new HttpException(
        { success: false, msg: 'Usuário não encontrado!' },
        401,
      );

    this.users.update(user.id, { token: null });

    return { success: true };
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: `${process.env.UPLOAD_FOLDER}/avatar`,
        filename: UtilsService.generateFileName,
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    return await this.users.update(id, {
      avatar: file.filename,
      ...data,
    });
  }
}
