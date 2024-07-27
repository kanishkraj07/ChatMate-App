import {createClient, RedisClientType} from 'redis';
import UserManager from './UserManager';
import { WebSocket } from 'ws';

class RedisClientManager {
    private static instance: RedisClientManager;
    private publishClient: RedisClientType;
    private subscribeClient: RedisClientType;

    private constructor() {
       
    }

    private onRedisClientError(error) {
        console.log(error);
    }

    public async initRedis(): Promise<void> {
        this.publishClient = createClient();
        this.subscribeClient = createClient();

        this.publishClient.on('error', this.onRedisClientError);
        this.subscribeClient.on('error',this.onRedisClientError);

        await this.publishClient.connect();
        await this.subscribeClient.connect();
    }

    public static getInstance(): RedisClientManager {
        if(!this.instance) {
            this.instance = new RedisClientManager();
        }

        return this.instance
    }

    public async subscribe(channelName: string, currentUserId: string): Promise<void> {
        await this.subscribeClient.subscribe(channelName, (data) => {
            const ws = UserManager.getInstance().getWSByUserId(currentUserId);
            if(ws && ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        })
    }

    public async publish(channelName: string, payload: string): Promise<void> {
       await this.publishClient.publish(channelName, payload)
    }

    public async push(queueName: string, payload: string): Promise<void> {
        await this.publishClient.lPush(queueName, payload)
    }
}


export default RedisClientManager;