import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  async processContent(url: string) {
    return `Le contenu envoyé : ${url}`;
  }
}
