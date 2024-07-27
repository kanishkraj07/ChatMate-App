export enum MessageType {
    CHAT = 'chat',
    GROUP = 'group',
    ROOM = 'room'
}

export enum ChatSubType {
    MESSAGE = 'message',
    SEEN_MESSAGES = 'seenMessages'
}


export interface ChatMessage {
    friendshipId: string;
    toUserId: string;
    fromUserId: string;
    relationshipId: string;
    message: string;
    sentTime: Date;
}
 
export interface SeenMessage {
    friendshipId: string;
    relationshipId: string;
    fromUserId: string;
    toUserId: string;
}