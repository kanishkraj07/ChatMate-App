export enum GroupSubType {
    CREATE = 'create',
    ADD_MEMBERS = 'addMembers',
    MESSAGE = 'message',
    SEEN_MESSAGES = 'seenMessages',
    LEFT = 'left'
}

export interface NewGroupPayload {
    ownerId: string;
    name: string;
    members: string[]
}

export interface Group extends NewGroupPayload {
    id: string;
    memberCount: number;
    createdAt: Date
}

export interface SeenGroupMessage {
    groupId: string;
    memberId: string;
}

export interface UserGroup {
    id: string;
    userId: string;
    groupId: string;
    isOwner: boolean;
    joinedDate: Date;
    status: UserGroupStatus
}

export enum UserGroupStatus {
    JOINED = 'joined',
    LEFT = 'left'
}

export interface GroupMessage {
    groupId: string;
    memberId: string;
    message: string;
    sentTime: Date;
}

export enum GroupPublishSubType {
    MEMBER_ADDED = 'memberAdded',
    LEFT = 'left',
    MESSAGE = 'message',
    CREATED = 'created'
}

export interface AddMemberPayload {
    groupId: string;
    groupName: string;
    ownerId: string;
    ownerName: string;
    members: Member[];
    addedAt: Date;
}

export interface AddMembersPayload {
    groupId: string;
    ownerId: string;
    members: string[];
    addedAt: Date;
}

export interface Member {
    memberId: string;
    userId: string;
}

export interface OwnerDetails {
    username?: string;
    fristName?: string;
    lastName?: string;
    email: string;
}