import { GroupSender } from "./Group";

export enum Sender {
    ME = 'me',
    FRIEND = 'friend'
}

export interface MessageBody {
    message: string;
    isSeen: boolean;
    date: Date;
    isFollowedMsg?: boolean;
}

export interface RecentMessageDetails {
    message: string,
    isMessageSeen?: boolean,
    senderName?: string;
    lastMessageSender?: Sender | GroupSender
    messageDeliveryTime: Date
}

export interface FriendRecentMessageDetails {
    friendId?: string;
    friendName: string;
    recentMessageDetails: RecentMessageDetails;
    newMessagesCount: number;
}

export interface FriendChatPlaygroundDetails {
    friendId?: string;
    friendName: string;
    messages?: Message[]
}

export interface Message {
    message: string;
    sentBy: Sender;
    sentTime: Date;
    isSeen?: boolean;
}

export interface FriendshipDetails {
    friendshipId: string;
    relationshipId: string;
    fromUserId: string;
    toUserId: string;
}

export interface ChatMessagePayload extends FriendshipDetails {
    message: string;
    sentTime: Date
}