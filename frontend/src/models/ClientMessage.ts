import { ChatMessagePayload } from "./ChatMessages";

export interface ClientMessage {
    type: ClientMessageType;
    subType: ClientMessageSubType;
    payload: ChatMessagePayload | any;
    metadata?: any;
}

export enum ClientMessageType {
    CHAT = 'chat',
    GROUP = 'group'
}

export enum ClientMessageSubType {
    MESSAGE = 'message',
    SEEN_MESSAGES = 'seenMessages',
    MEMBER_ADDED = 'memberAdded'
}
