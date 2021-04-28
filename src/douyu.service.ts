import Redis from 'ioredis';
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
        const page = this.page;

        const url = 'https://www.douyu.com/' + rid;
        await page.goto(url);
        page.on('response', async (response) => {
          const url = response.url();
          if (url.includes('lapi/live/getH5Play')) {
            const json = await response.json();

            if (json.error === 0) {
              const rtmp_live = json.data.rtmp_live;
              const match = rtmp_live.match(/([^_]+)(\_\w+)?(\.[^?]+)/);
              const new_rtmp = match[1] + match[3];

              const res = 'http://tx2play1.douyucdn.cn/live/' + new_rtmp;
              resolve({ err: 0, data: res });
              return;
            }
            if (json.error === 102) {
              resolve({ err: 1, data: '房间不存在' });
            } else if (json.error === -5) {
              resolve({ err: 2, data: '房间未开播' });
            } else if (json.error !== 0) {
              resolve('未知错误');
            }

            //房间未开播，删除redis zset中的对应数据
            const redis = this.redisSerive.redis;
            try {
              await redis.zrem(this.REDIS_ROOMS_SET_KEY, rid);
            } catch (e) {
              console.log('zrem err');
              console.log(e);
            }
          }
        });

        await page.waitForTimeout(5000);
        resolve({ err: '5', data: '超时' });
      } catch (error) {
        console.log('douyu service getPlayUrl error');
        console.log(error);
        reject(error);
      }
    });

  @Interval(1000 * 60 * 60, {
    waiting: true,
    immediate: true,
    retryInterval: 2000,
    maxRetry: 3,
  })
  async spider() {
    const page = this.page;
    const redis = this.redisSerive.redis;
    console.log('run douyu spider task...');

    await page.goto('https://www.douyu.com/directory/all');

    //房间索引
    let roomIndex = 0;
    //页码
    let pageNum = 0;

    interface RoomInfo {
      title: string;
      coverImg: string;
      username: string;
      rid: string;
    }


    while (true) {
      pageNum++;
      console.log('starting ' + pageNum);

      await page.waitForSelector('.ListFooter', {
        timeout: 10000,
      });
      await page.waitForTimeout(1500);
      await autoScroll(page);
      await page.waitForTimeout(500);

      const data: RoomInfo[] = await page.$$eval(
        '.layout-Module .layout-Cover-list li a.DyListCover-wrap',
        (items) => {
          return items.map((item) => {
            const title = item
              .querySelector('.DyListCover-intro')
              .getAttribute('title');
            const coverImg = item
              .querySelector('.DyImg-content')
              .getAttribute('src');
            const username = item.querySelector('.DyListCover-user')
              .textContent;
            const rid = item.getAttribute('href').substring(1);
            const res = {
              title,
              coverImg,
              username,
              rid,
            };
            return res;
          });
        },
      );

      //清除redis的set
      if (pageNum == 1) {
        await redis.del(this.REDIS_ROOMS_SET_KEY);
      }

      // 添加到redis
      const pipeline = redis.pipeline();
      for (const room of data) {
        //加到zset中，score是索引，value是rid
        pipeline.zadd(this.REDIS_ROOMS_SET_KEY, roomIndex++, room.rid);
        //加到hash中，key是rid，value是详细值
        pipeline.hmset(
          `${this.REDIS_ROOMS_HASH_KEY}::${room.rid}::${room.username}`,
          'title',
          room.title,
          'coverImg',
          room.coverImg,
        );
      }
      await pipeline.exec();

      //下一页
      try {
        await page.waitForSelector('.ListFooter .dy-Pagination-next', {
          timeout: 5000,
        });

        //最后一页
        const isLast = await page.$eval(
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
        console.log('-----spider error----');
        console.log(e);
        break;
      }
    }


    //设置rid过期时间,1小时,因为redis主要存当前开播的rid
    redis.expire(this.REDIS_ROOMS_SET_KEY, 3600000 * 1);
  }
}

//滑倒底
//https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve('');
        }
      }, 300);
    });
  });
}
