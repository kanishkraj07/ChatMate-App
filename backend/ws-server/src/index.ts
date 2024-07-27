import express from 'express';
import { WebSocketServer } from 'ws';
import url from 'url';
import  jsonWebToken from 'jsonwebtoken';
import dotenv from 'dotenv';
import { MessageType, ChatSubType, ChatMessage, SeenMessage } from './models/Chats';
import UserManager from './managers/UserManager';
import { ALL_SERVICES, WsMessage } from './models/ws_message';
import RedisClientManager from './managers/RedisClientManager';
import ChatManager from './managers/ChatManager';
import path from 'path';
import { AddMembersPayload, GroupMessage, GroupSubType, NewGroupPayload, SeenGroupMessage } from './models/Groups';
import GroupManager from './managers/GroupManager';
import cors from 'cors';


const app = express();

app.use(cors());

dotenv.config({path:  path.resolve('../.env')});

const httpServer = app.listen(process.env.PORT || 8000);

const wss: WebSocketServer = new WebSocketServer({
    server: httpServer
});

(async () => {
    await RedisClientManager.getInstance().initRedis();
})();

(async () => {
    await UserManager.getInstance().loadUserGroupDetails();
})()


const authCheck = (token: string): string => {
    try {
        return (jsonWebToken.verify(token, process.env.JWT_SECRET_KEY || 'SECRET_KEY' ) as {userId: string}).userId;
    } catch(e) {
        return '';
    }
}


wss.on('connection', (ws, request, isBinary) => {

    // const token: string = url.parse(request.url, true).query.token?.toString() || '';

    // const userId: string = authCheck(token);

    // if(!userId) {
    //     ws.close();
    //     return;
    // }

    const userId = url.parse(request.url, true).query.userId?.toString() || '';
    if(!UserManager.getInstance().getUserMap().has(userId)) {
        subscribeTopics(userId);
        UserManager.getInstance().addNewUser(ws, userId);
    } else {
        UserManager.getInstance().updateUser(ws, userId);
    }
    

    ws.on('message', (message) => {
        const data: WsMessage = JSON.parse(message);
        
        switch(data.type) {
            case MessageType.CHAT:  chatHandler(data.subType, data.payload, userId);
                                    return;
            case MessageType.GROUP: 
                                    groupHandler(data.subType, data.payload)
                                    return;
            case MessageType.ROOM:
                                    return;
            default: return

        }
    });

    ws.on('error', () => {

    });

    ws.on('close', () => {
        UserManager.getInstance().deleteUser(userId);
    });
})


const chatHandler = async(subType: ChatSubType | unknown, payload: ChatMessage | SeenMessage, currentUserId: string) => {
   if(subType === ChatSubType.MESSAGE) {
    await ChatManager.getInstance().sendMessage(payload as ChatMessage)
   }

   if(subType === ChatSubType.SEEN_MESSAGES) {
    await ChatManager.getInstance().seenMessages(payload as SeenMessage)
   }
}

const groupHandler = async(subType: GroupSubType | unknown, payload: NewGroupPayload | AddMembersPayload | GroupMessage | SeenGroupMessage
) => {
    if(subType === GroupSubType.CREATE) {
        await GroupManager.getInstance().createGroup(payload as NewGroupPayload)
    }

    if(subType === GroupSubType.MESSAGE) {
       await GroupManager.getInstance().broadcastMessage(payload as GroupMessage)
    }

    if(subType === GroupSubType.SEEN_MESSAGES) {
        await GroupManager.getInstance().seenGroupMessage(payload as SeenGroupMessage)
     }
}

const subscribeTopics = (currentUserId: string) => {
   ALL_SERVICES.forEach((service: String) => RedisClientManager.getInstance().subscribe(`${service}:${currentUserId}`, currentUserId));
}