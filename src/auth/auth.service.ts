import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UtilsService } from 'src/services/utils/utils.service';
import { UserService } from 'src/user/user.service';

export interface ValidateSuccess {
  success: true;
  token: string;
}

export interface ValidateFail {
  success: false;
  msg: string;
}

export type ValidateResponse = ValidateFail | ValidateSuccess;

@Injectable()
export class AuthService {
  constructor(private user: UserService, private utils: UtilsService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidateResponse> {
    const user = await this.user.findByEmail(email);
    if (!user) return { success: false, msg: 'User not found!' };

    if (user.password !== password)
      return { success: false, msg: 'Wrong password!' };

    const token = this.utils.generateToken(3, 30, '-');
    this.user.update(user.id, { token });

    return { success: true, token };
  }

  async validateToken(token: string): Promise<User | null> {
    return await this.user.findByToken(token);
  }
}
