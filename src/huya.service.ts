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
    await this.page.waitForSelector('.box-bd .search-live-list', {
      timeout: 5000,
    });
    const list = await this.page.$$eval(
      '.search-box:nth-of-type(3) .box-bd .search-live-list .game-live-item',
      (els) => {
        return els.map((el) => {
          return {
            coverImg: el.querySelector('.pic').getAttribute('src'),
            title: el.querySelector('.title').getAttribute('title'),
            name: el.querySelector('.nick').getAttribute('title'),
            rid: el
              .querySelector('.title')
              .getAttribute('href')
              .split('/')
              .pop(),
          };
        });
      },
    );
    console.log(list);
  }
}
