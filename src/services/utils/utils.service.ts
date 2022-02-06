import { Injectable } from '@nestjs/common';
import { Request } from 'express';

interface RandomStringOptions {
  onlyNumbers?: boolean;
  onlyLetters?: boolean;
  onlySymbols?: boolean;
  onlyUppercase?: boolean;
}

@Injectable()
export class UtilsService {
  generateToken(sections: number, length: number, divider: string) {
    return Array(sections)
      .fill('')
      .map(() => this.generateRandomString(length))
      .join(divider);
  }

  generateRandomString(length: number, options?: RandomStringOptions) {
    return Array(length)
      .fill('')
      .map(() => {
        const chars = [];
        const numbers = '0123456789';
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const symbols = '!@#$%^&*()_+=-';

        if (options?.onlyNumbers) {
          chars.push(...numbers);
        } else if (options?.onlyLetters) {
          chars.push(...letters);
        } else if (options?.onlyUppercase) {
          chars.push(...upperLetters);
        } else if (options?.onlySymbols) {
          chars.push(...symbols);
        } else {
          chars.push(...letters, ...upperLetters, ...numbers, ...symbols);
        }

        return chars.join('')[Math.floor(Math.random() * chars.length)];
      })
      .join('');
  }

  static generateFileName(
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, name: string) => void,
  ) {
    const parsedName = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '-')
      .toLowerCase();

    const fileName = `${Date.now()}-${parsedName}`;

    cb(null, fileName);
  }
}
