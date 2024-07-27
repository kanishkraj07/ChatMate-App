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
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Chats_1 = require("./models/Chats");
const UserManager_1 = __importDefault(require("./managers/UserManager"));
const ws_message_1 = require("./models/ws_message");
const RedisClientManager_1 = __importDefault(require("./managers/RedisClientManager"));
const ChatManager_1 = __importDefault(require("./managers/ChatManager"));
const path_1 = __importDefault(require("path"));
const Groups_1 = require("./models/Groups");
const GroupManager_1 = __importDefault(require("./managers/GroupManager"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
dotenv_1.default.config({ path: path_1.default.resolve('../.env') });
const httpServer = app.listen(process.env.PORT || 8000);
const wss = new ws_1.WebSocketServer({
    server: httpServer
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield RedisClientManager_1.default.getInstance().initRedis();
}))();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield UserManager_1.default.getInstance().loadUserGroupDetails();
}))();
const authCheck = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || 'SECRET_KEY').userId;
    }
    catch (e) {
        return '';
    }
};
wss.on('connection', (ws, request, isBinary) => {
    // const token: string = url.parse(request.url, true).query.token?.toString() || '';
    var _a;
    // const userId: string = authCheck(token);
    // if(!userId) {
    //     ws.close();
    //     return;
    // }
    const userId = ((_a = url_1.default.parse(request.url, true).query.userId) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    if (!UserManager_1.default.getInstance().getUserMap().has(userId)) {
        subscribeTopics(userId);
        UserManager_1.default.getInstance().addNewUser(ws, userId);
    }
    else {
        UserManager_1.default.getInstance().updateUser(ws, userId);
    }
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case Chats_1.MessageType.CHAT:
                chatHandler(data.subType, data.payload, userId);
                return;
            case Chats_1.MessageType.GROUP:
                groupHandler(data.subType, data.payload);
                return;
            case Chats_1.MessageType.ROOM:
                return;
            default: return;
        }
    });
    ws.on('error', () => {
    });
    ws.on('close', () => {
        UserManager_1.default.getInstance().deleteUser(userId);
    });
});
const chatHandler = (subType, payload, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (subType === Chats_1.ChatSubType.MESSAGE) {
        yield ChatManager_1.default.getInstance().sendMessage(payload);
    }
    if (subType === Chats_1.ChatSubType.SEEN_MESSAGES) {
        yield ChatManager_1.default.getInstance().seenMessages(payload);
    }
});
const groupHandler = (subType, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (subType === Groups_1.GroupSubType.CREATE) {
        yield GroupManager_1.default.getInstance().createGroup(payload);
    }
    if (subType === Groups_1.GroupSubType.MESSAGE) {
        yield GroupManager_1.default.getInstance().broadcastMessage(payload);
    }
    if (subType === Groups_1.GroupSubType.SEEN_MESSAGES) {
        yield GroupManager_1.default.getInstance().seenGroupMessage(payload);
    }
});
const subscribeTopics = (currentUserId) => {
    ws_message_1.ALL_SERVICES.forEach((service) => RedisClientManager_1.default.getInstance().subscribe(`${service}:${currentUserId}`, currentUserId));
};
