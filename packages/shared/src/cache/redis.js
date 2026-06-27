import Redis from 'ioredis';
import { config } from '../config/env.js';

class RedisConnection {
  static #instance = null;
  #client = null;

  constructor() {
    if (RedisConnection.#instance) {
      return RedisConnection.#instance;
    }
    RedisConnection.#instance = this;
  }

  getClient() {
    if (!this.#client) {
      this.#client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.#client.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
      });
    }
    return this.#client;
  }

  async connect() {
    const client = this.getClient();
    if (client.status === 'ready') return client;
    await client.connect();
    return client;
  }

  async disconnect() {
    if (this.#client) {
      await this.#client.quit();
      this.#client = null;
    }
  }
}

export const redisConnection = new RedisConnection();
export default redisConnection;
