import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DouyuController } from './douyu.controller';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';
import { PuppeteerService } from './puppeteer.service';

@Module({
  imports: [],
  controllers: [AppController, DouyuController],
  providers: [AppService, DouyuService, PuppeteerService],
})
export class AppModule {}
