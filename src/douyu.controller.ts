import { Controller, Get, Param } from '@nestjs/common';
import { DouyuService } from './douyu.service';

@Controller('/douyu')
export class DouyuController {
  constructor(private readonly douyuService: DouyuService) {}

  @Get(':id')
  async getPlayUrl(@Param('id') id): Promise<any> {
    return await this.douyuService.getPlayUrl(id);
  }
}
