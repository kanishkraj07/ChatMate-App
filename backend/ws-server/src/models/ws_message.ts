import { MessageType, ChatSubType, ChatMessage } from "./Chats";
import { AddMemberPayload, GroupMessage, GroupPublishSubType, GroupSubType, NewGroupPayload } from "./Groups";

export const NOTIFICATION_QUEUE = 'Notification_Queue';

export interface WsMessage {
    type: MessageType;
    subType: ChatSubType | GroupSubType;
    payload: ChatMessage | NewGroupPayload | GroupMessage | any
}

export interface PublishPayload {
    type: MessageType,
    subType: ChatSubType | GroupPublishSubType | any,
    payload: ChatMessage | AddMemberPayload | GroupMessage | any
}

export const ALL_SERVICES: string[] = ['chat', 'group', 'room', 'friendRequest', 'notification'];