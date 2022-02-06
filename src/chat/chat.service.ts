import { Injectable } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private db: PrismaService) {}

  async getRooms(userId: string): Promise<Room[]> {
    const userRooms = await this.db.userRoom.findMany({
      where: { userId },
      include: { room: true },
    });

    return userRooms.map((userRoom) => userRoom.room);
  }
  async findRoomByCode(code: string) {
    return await this.db.room.findFirst({
      where: { code },
      include: { users: true },
    });
  }

  async getMessages(code: string) {
    const messages = await this.db.message.findMany({
      where: { room: { code } },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachment: true,
      },
    });

    return messages;
  }

  async createRoom(data: Prisma.RoomCreateInput) {
    return await this.db.room.create({ data });
  }

  async addUserToRoom(userId: string, roomId: string) {
    const userIsInRoom = await this.db.userRoom.findFirst({
      where: { userId, roomId },
    });

    if (userIsInRoom) return null;

    return await this.db.userRoom.create({
      data: { userId, roomId },
    });
  }

  async createMessage(data: Prisma.MessageCreateInput) {
    const message = await this.db.message.create({
      data,
      select: {
        id: true,
        text: true,
        date: true,
        gif: true,
        userId: true,
        roomId: true,
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        attachment: {
          select: { id: true, url: true, type: true },
        },
      },
    });

    return message;
  }
}
