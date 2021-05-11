import { Controller, Get, Param } from '@nestjs/common';
import { HuyaService } from './huya.service';

@Controller('/huya')
export class HuyaController {
  constructor(private readonly huyaService: HuyaService) {}

  @Get('search/:name')
  async getHello(@Param('name') name): Promise<any> {
    return await this.huyaService.search(name);
  }
}
