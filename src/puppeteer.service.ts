import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  public getPuppeteerPage = async () => {
    const browser = await puppeteer.launch({
      // headless: false,
      defaultViewport: {
        width: 2400,
        height: 1200,
      },
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();
    return page;
  };
}
