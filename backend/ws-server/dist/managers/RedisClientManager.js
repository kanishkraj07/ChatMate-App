"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const UserManager_1 = __importDefault(require("./UserManager"));
const ws_1 = require("ws");
class RedisClientManager {
    constructor() {
    }
    onRedisClientError(error) {
        console.log(error);
    }
    initRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            this.publishClient = (0, redis_1.createClient)();
            this.subscribeClient = (0, redis_1.createClient)();
            this.publishClient.on('error', this.onRedisClientError);
            this.subscribeClient.on('error', this.onRedisClientError);
            yield this.publishClient.connect();
            yield this.subscribeClient.connect();
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisClientManager();
        }
        return this.instance;
    }
    subscribe(channelName, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribeClient.subscribe(channelName, (data) => {
                const ws = UserManager_1.default.getInstance().getWSByUserId(currentUserId);
                if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.send(data);
                }
            });
        });
    }
    publish(channelName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.publishClient.publish(channelName, payload);
        });
    }
    push(queueName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.publishClient.lPush(queueName, payload);
        });
    }
}
exports.default = RedisClientManager;
