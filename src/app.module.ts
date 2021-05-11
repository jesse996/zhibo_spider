import { HuyaController } from './huya.controller';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DouyuController } from './douyu.controller';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';
import { ScheduleModule } from 'nest-schedule';
import RedisService from './redis.service';
import { HuyaService } from './huya.service';
import { PuppeteerService } from './puppeteer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ScheduleModule.register(), ConfigModule.forRoot()],
  controllers: [AppController, HuyaController, DouyuController],
  providers: [
    AppService,
    DouyuService,
    PuppeteerService,
    RedisService,
    HuyaService,
  ],
})
export class AppModule {}
