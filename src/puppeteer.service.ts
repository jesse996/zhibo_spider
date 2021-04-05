import { Injectable } from '@nestjs/common';
const puppeteer = require('puppeteer');

@Injectable()
export class PuppeteerService {
  public getBrowserAndPage = async () => {
    const browser = await puppeteer.launch({
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage',
      ],
    });
    let page = await browser.newPage();
    return page;
  };
}
