import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export default class RedisService {
  redis: Redis;

  constructor() {
    this.redis = new Redis({
      port: 6379, // Redis port
      host: 'redis', // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      // password: '123',
      password: '',
      db: 0,
    });
  }
}
