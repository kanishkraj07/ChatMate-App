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
const client_1 = require("@prisma/client");
const RedisClientManager_1 = __importDefault(require("./RedisClientManager"));
const UserManager_1 = __importDefault(require("./UserManager"));
const uuid_1 = require("uuid");
const Chats_1 = require("../models/Chats");
class ChatManager {
    constructor() {
        this.prismaClient = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ChatManager();
        }
        return this.instance;
    }
    sendMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            const isRelationshipActive = yield UserManager_1.default.getInstance().validateFriend(payload.relationshipId);
            console.log(isRelationshipActive);
            if (isRelationshipActive) {
                yield this.prismaClient.friendsOnUser.update({
                    where: {
                        id: payload.friendshipId,
                        userId: payload.fromUserId,
                        relationshipId: payload.relationshipId
                    },
                    data: {
                        notificationCount: {
                            increment: 1
                        }
                    }
                });
                yield this.prismaClient.chat.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        senderId: payload.fromUserId,
                        message: payload.message,
                        relationshipId: payload.relationshipId,
                        sentTime: payload.sentTime
                    }
                });
                const chatPublishPayload = {
                    type: Chats_1.MessageType.CHAT,
                    subType: Chats_1.ChatSubType.MESSAGE,
                    payload
                };
                yield RedisClientManager_1.default.getInstance().publish(`chat:${payload.toUserId}`, JSON.stringify(chatPublishPayload));
            }
        });
    }
    seenMessages(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prismaClient.friendsOnUser.update({
                where: {
                    id: payload.friendshipId,
                    relationshipId: payload.relationshipId
                },
                data: {
                    notificationCount: 0
                }
            });
            yield this.prismaClient.chat.updateMany({
                where: {
                    relationshipId: payload.relationshipId,
                    senderId: payload.toUserId
                },
                data: {
                    isSeen: true
                }
            });
        });
    }
}
exports.default = ChatManager;
