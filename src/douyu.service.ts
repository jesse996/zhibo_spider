import { Injectable } from '@nestjs/common';
import { Interval, NestSchedule } from 'nest-schedule';
import { PuppeteerService } from './puppeteer.service';
import RedisService from './redis.service';

@Injectable()
export class DouyuService extends NestSchedule {
  page: any;
  readonly REDIS_ROOMS_SET_KEY = 'douyu::rooms::set';
  readonly REDIS_ROOMS_HASH_KEY = 'douyu::rooms::hash';

  constructor(
    readonly puppeteerService: PuppeteerService,
    readonly redisSerive: RedisService,
  ) {
    super();
    this.puppeteerService.getBrowserAndPage().then((data) => {
      this.page = data;
    });
  }

  getPlayUrl = (rid: string) =>
    new Promise(async (resolve, reject) => {
      try {
        // const page = await this.puppeteerService.getBrowserAndPage();
        const page = this.page;

        const url = 'https://www.douyu.com/' + rid;
        await page.goto(url);
        page.on('response', async (response) => {
          let url = response.url();
          if (url.includes('lapi/live/getH5Play')) {
            let json = await response.json();
            if (json.error === 102) {
              resolve({ err: 1, data: '房间不存在' });
              return;
            } else if (json.error === -5) {
              resolve({ err: 2, data: '房间未开播' });
              return;
            }

            if (json.error !== 0) {
              resolve('未知错误');
              return;
            }

            let rtmp_live = json.data.rtmp_live;
            let match = rtmp_live.match(/([^_]+)(\_\w+)?(\.[^?]+)/);
            let new_rtmp = match[1] + match[3];

            let res = 'http://tx2play1.douyucdn.cn/live/' + new_rtmp;
            resolve({ err: 0, data: res });
            return;
          }
        });

        await page.waitForTimeout(5000);
        resolve({ err: '5', data: '超时' });
      } catch (error) {
        reject(error);
      }
    });

  @Interval(1000 * 60 * 60, { immediate: true })
  async spider() {
    const page = this.page;
    const redis = this.redisSerive.redis;

    await page.goto('https://www.douyu.com/directory/all');

    let cnt = 1;
    while (true) {
      console.log('page:', cnt++);

      //滑到底,有bug
      await page.waitForSelector('.ListFooter', {
        timeout: 10000,
      });
      await page.evaluate(() => {
        document
          .querySelector('.ListFooter')
          .scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      let data = await page.$$eval(
        '.layout-Module .layout-Cover-list li a.DyListCover-wrap',
        (items) => {
          return items.map((item) => {
            let title = item
              .querySelector('.DyListCover-intro')
              .getAttribute('title');
            let coverImg = item
              .querySelector('.DyImg-content')
              .getAttribute('src');
            let username = item.querySelector('.DyListCover-user').textContent;
            let rid = item.getAttribute('href').substring(1);
            let res = {
              title,
              coverImg,
              username,
              rid,
            };
            return res;
          });
        },
      );

      // 添加到redis
      let pipeline = redis.pipeline();
      for (const room of data) {
        //加到zset中，score是时间，value是rid
        pipeline.zadd(this.REDIS_ROOMS_SET_KEY, Date.now(), room.rid);
        //加到hash中，key是rid，value是详细值
        pipeline.hset(
          this.REDIS_ROOMS_HASH_KEY,
          room.rid,
          JSON.stringify({
            title: room.title,
            coverImg: room.coverImg,
            username: room.username,
          }),
        );
      }
      await pipeline.exec();

      //下一页
      try {
        await page.waitForSelector('.ListFooter .dy-Pagination-next', {
          timeout: 5000,
        });

        await page.waitForTimeout(1000);

        //最后一页
        let isLast = await page.$eval(
          '.ListFooter .dy-Pagination-next',
          (el) => {
            return el.getAttribute('aria-disabled');
          },
        );
        if (isLast === 'true') {
          console.log('last page end');
          break;
        }

        await page.click(
          '.ListFooter .dy-Pagination-next .dy-Pagination-item-custom',
        );
      } catch (e) {
        console.log('');
        console.log('-----finish----');
        break;
      }
    }

    //设置rid过期时间,6小时,因为redis主要存当前开播的rid
    redis.expire(this.REDIS_ROOMS_SET_KEY, 3600000 * 6);

    await redis.quit();
  }
}
