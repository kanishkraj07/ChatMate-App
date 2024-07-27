"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSubType = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["CHAT"] = "chat";
    MessageType["GROUP"] = "group";
    MessageType["ROOM"] = "room";
})(MessageType || (exports.MessageType = MessageType = {}));
var ChatSubType;
(function (ChatSubType) {
    ChatSubType["MESSAGE"] = "message";
    ChatSubType["SEEN_MESSAGES"] = "seenMessages";
})(ChatSubType || (exports.ChatSubType = ChatSubType = {}));
