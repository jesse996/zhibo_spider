import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export default class RedisService {
  redis: Redis.Redis;

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      port: 6379, // Redis port
      host: config.get('REDIS_URL'), // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      password: '',
      db: 0,
    });
  }
}
