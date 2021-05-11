import { HuyaController } from './huya.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DouyuController } from './douyu.controller';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';
import { PuppeteerService } from './puppeteer.service';
import { ScheduleModule } from 'nest-schedule';
import RedisService from './redis.service';
import { HuyaService } from './huya.service';

@Module({
  imports: [ScheduleModule.register()],
  controllers: [AppController, DouyuController, HuyaController],
  providers: [
    AppService,
    DouyuService,
    PuppeteerService,
    RedisService,
    HuyaService,
  ],
})
export class AppModule {}
