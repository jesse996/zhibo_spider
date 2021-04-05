import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DouyuController } from './douyu.controller';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';
import { PuppeteerService } from './puppeteer.service';
import { ScheduleModule } from 'nest-schedule';
import RedisService from './redis.service';

@Module({
  imports: [ScheduleModule.register()],
  controllers: [AppController, DouyuController],
  providers: [AppService, DouyuService, PuppeteerService, RedisService],
})
export class AppModule {}
