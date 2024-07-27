export enum UserGroupStatus {
    JOINED = 'joined',
    LEFT = 'left'
}

export interface NewGroupRequest {
    ownerId: string;
    name: string;
    members: string[]
}

export interface Group extends NewGroupRequest {
    id: string;
    memberCount: number;
    iconUrl: string;
    createdAt: Date
}

export interface UserGroup {
    id: string;
    userId: string;
    groupId: string;
    isOwner: boolean;
    joinedDate: Date;
    status: UserGroupStatus,
    notificationCount: number
}

export interface Member {
    memberId: string;
    userId: string;
    userName: string;
    email: string;
}

export interface AddMemberPayload {
    groupId: string;
    groupName: string;
    iconUrl: string;
    ownerId: string;
    ownerName: string;
    members: Member[];
    addedAt: Date;
}