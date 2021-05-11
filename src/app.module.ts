import { HuyaController } from './huya.controller';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DouyuController } from './douyu.controller';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';
import { ScheduleModule } from 'nest-schedule';
import RedisService from './redis.service';
import { InjectBrowser, PuppeteerModule } from 'nest-puppeteer';
import { Browser } from 'puppeteer';
import { HuyaService } from './huya.service';

@Module({
  imports: [
    ScheduleModule.register(),
    PuppeteerModule.forRoot({ isGlobal: false }),
    PuppeteerModule.forFeature(),
  ],
  controllers: [AppController, HuyaController, DouyuController],
  providers: [AppService, DouyuService, RedisService, HuyaService],
})
export class AppModule {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async configure() {
    const version = await this.browser.version();
    Logger.log(`Launched browser: ${version}`, 'Test');
  }
}
