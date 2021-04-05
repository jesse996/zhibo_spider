import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { DouyuService } from './douyu.service';

@Controller('/douyu')
export class DouyuController {
  constructor(private readonly douyuService: DouyuService) {}

  @Get(':id')
  async getHello(@Param('id') id): Promise<any> {
    try {
      return await this.douyuService.getPlayUrl(id);
    } catch (e) {
      return { err: 2, data: '未知错误' };
    }
  }
}
