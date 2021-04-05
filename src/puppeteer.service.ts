import { Injectable } from '@nestjs/common';
const puppeteer = require('puppeteer');

@Injectable()
export class PuppeteerService {
  public getBrowserAndPage = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      devtools: true,
    });
    let page = await browser.newPage();
    return page;
  };
}
