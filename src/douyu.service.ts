import { Injectable } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';

@Injectable()
export class DouyuService {
  constructor(readonly puppeteerService: PuppeteerService) {}

  getPlayUrl = (rid: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const page = await this.puppeteerService.getBrowserAndPage();

        async function handleClose() {
          // await page.close();
          // await browser.close();
          // process.exit(1);
        }

        const url = 'https://www.douyu.com/' + rid;
        await page.goto(url);
        page.on('response', async (response) => {
          let url = response.url();
          if (url.includes('lapi/live/getH5Play')) {
            let json = await response.json();
            if (json.error === 102) {
              // console.log('房间不存在')
              resolve({ err: 1, data: '房间不存在' });
              await handleClose();
              return;
            } else if (json.error === -5) {
              // console.log('房间未开播')
              resolve({ err: 2, data: '房间未开播' });
              await handleClose();
              return;
            }

            if (json.error !== 0) {
              resolve('未知错误');
              await handleClose();
              return;
            }

            let rtmp_live = json.data.rtmp_live;
            let match = rtmp_live.match(/([^_]+)(\_\w+)?(\.[^?]+)/);
            let new_rtmp = match[1] + match[3];

            let res = 'http://tx2play1.douyucdn.cn/live/' + new_rtmp;
            resolve({ err: 0, data: res });
            await handleClose();
          }
        });

        await page.waitForTimeout(5000);
        resolve({ err: '5', data: '超时' });
      } catch (error) {
        reject(error);
      }
    });
}
