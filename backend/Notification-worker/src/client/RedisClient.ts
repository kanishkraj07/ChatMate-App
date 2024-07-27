import {createClient, RedisClientType} from 'redis';

class RedisClient {
    private static instance: RedisClient;
    private redisClient: RedisClientType;

    private constructor() {
    }

    public async initRedis(): Promise<void> {
        this.redisClient = createClient();
        await this.redisClient.connect();
    }

    public static getInstance(): RedisClient {
        if(!this.instance) {
            this.instance = new RedisClient();
        }

        return this.instance
    }

    public async publish(channelName: string, payload: string): Promise<void> {
       await this.redisClient.publish(channelName, payload)
    }
}