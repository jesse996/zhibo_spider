import { Injectable } from '@nestjs/common';
import type { Page } from 'puppeteer';
import { InjectPage } from 'nest-puppeteer';

@Injectable()
export class HuyaService {
  constructor(
    @InjectPage() private readonly page: Page, // readonly
  ) {}

  async search(name: string) {
    await this.page.goto(`https://www.huya.com/search?hsk=${name}`);
    await this.page.waitForSelector('.search-box', {
      timeout: 5000,
    });

    const liveList =
      (await this.page.$$eval('.search-box', (els) => {
        for (const el of els) {
          const exitLive: boolean = el
            .querySelector('.box-hd>h3.title')
            .innerHTML.includes('相关直播');
          if (exitLive) {
            const res = [];
            el.querySelectorAll('.search-live-list .game-live-item').forEach(
              (el) => {
                const tmp = {
                  coverImg: el.querySelector('.pic').getAttribute('src'),
                  title: el.querySelector('.title').getAttribute('title'),
                  name: el.querySelector('.nick').getAttribute('title'),
                  rid: el
                    .querySelector('.title')
                    .getAttribute('href')
                    .split('/')
                    .pop(),
                };
                res.push(tmp);
              },
            );
            return res;
          }
        }
      })) || [];
    return liveList;
  }
}
