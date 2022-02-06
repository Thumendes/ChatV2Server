import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AttachmentType, Prisma, User as UserEntity } from '@prisma/client';
import { diskStorage } from 'multer';
import { UtilsService } from 'src/services/utils/utils.service';
import { User } from 'src/user/user.decorator';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private logger = new Logger('ChatController');

  constructor(
    private readonly chat: ChatService,
    private utils: UtilsService,
  ) {}

  @Get('/rooms')
  async getRooms(@User() user: UserEntity) {
    const rooms = await this.chat.getRooms(user.id);

    return rooms;
  }

  @Post('/rooms')
  async createRoom(
    @Body() data: Prisma.RoomCreateInput,
    @User() user: UserEntity,
  ) {
    data.code = this.utils.generateRandomString(6, { onlyNumbers: true });

    const room = await this.chat.createRoom(data);
    await this.chat.addUserToRoom(user.id, room.id);

    return room;
  }

  @Get('/messages/:code')
  async getMessages(@Param('code') code: string) {
    const messages = await this.chat.getMessages(code);

    return messages;
  }

  @Post('/upload')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: `${process.env.UPLOAD_FOLDER}/attachments`,
        filename: UtilsService.generateFileName,
      }),
    }),
  )
  async uploadAvatar(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log('Upload done!');

    const data = files.map((file) => {
      const isImage = file.mimetype.includes('image');
      const isVideo = file.mimetype.includes('video');
      const isAudio = file.mimetype.includes('audio');

      const type: AttachmentType = isImage
        ? 'IMAGE'
        : isVideo
        ? 'VIDEO'
        : isAudio
        ? 'AUDIO'
        : 'FILE';

      return {
        field: file.fieldname,
        url: file.filename,
        type,
      };
    });

    return { success: true, data };
  }
}
