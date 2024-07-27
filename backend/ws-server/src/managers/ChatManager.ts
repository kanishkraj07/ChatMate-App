import { PrismaClient } from "@prisma/client";
import RedisClientManager from "./RedisClientManager";
import UserManager from "./UserManager";
import {v4 as uuidv4} from "uuid";
import { ChatMessage, ChatSubType, MessageType, SeenMessage } from "../models/Chats";
import { PublishPayload } from "../models/ws_message";

class ChatManager {

    private static instance: ChatManager;
    private prismaClient: PrismaClient;

    private constructor() {
      this.prismaClient = new PrismaClient();
    }

    public static getInstance(): ChatManager {
        if(!this.instance) {
            this.instance = new ChatManager();
        }
         return this.instance;
    }

    public async sendMessage(payload: ChatMessage) {
      console.log(payload);
    const isRelationshipActive = await UserManager.getInstance().validateFriend(payload.relationshipId);

    console.log(isRelationshipActive);
    
    if(isRelationshipActive) {
      await this.prismaClient.friendsOnUser.update({
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

        await this.prismaClient.chat.create({
          data: {
            id: uuidv4(),
            senderId: payload.fromUserId,
            message: payload.message,
            relationshipId: payload.relationshipId,
            sentTime: payload.sentTime
          }
        });
        const chatPublishPayload: PublishPayload = {
          type: MessageType.CHAT,
          subType: ChatSubType.MESSAGE,
          payload
        } as PublishPayload;
        await RedisClientManager.getInstance().publish(`chat:${payload.toUserId}`, JSON.stringify(chatPublishPayload));
      }
    }

    public async seenMessages(payload: SeenMessage) {
      await this.prismaClient.friendsOnUser.update({
        where: {
          id: payload.friendshipId,
          relationshipId: payload.relationshipId
        },
        data: {
          notificationCount: 0
         }
      });
      await this.prismaClient.chat.updateMany({
        where: {
          relationshipId: payload.relationshipId,
          senderId: payload.toUserId
        },
        data: {
          isSeen: true
         }
      });
    }
}

export default ChatManager;