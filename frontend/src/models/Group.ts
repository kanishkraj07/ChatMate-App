export interface Group {
    groupId: string;
    groupName: string;
    ownerId: string;
    ownerName: string;
    members: Member[];
    iconUrl: string;
    addedAt: Date;
}

export interface Member {
    memberId: string;
    userId: string;
    userName: string;
    email: string;
}

export enum GroupSender {
    MEMBER = 'member',
    ME = 'me'
}

export interface GroupDetails extends Group {
    messages: GroupMessage[]
}

export interface GroupMessage {
    message: string;
    sentBy: GroupSender;
    sender: Member;
    sentTime: Date;
    isSeen?: boolean;
}

export interface GroupMessagePayload {
    groupId: string;
    memberId: string;
    message: string;
    sentTime: Date;
}