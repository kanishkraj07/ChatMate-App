import { string } from "zod";

export const NOTIFICATION_QUEUE = 'Notification_Queue';

export interface UserRegisterInputs {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface UserLoginInputs {
    email: string;
    password: string
}

export interface FriendRequest {
    friendRequestId?: string;
    fromUserId: string;
    toUserId: string;
    status: FriendRequestStatus;
}

export interface AcceptedFriendReqPayload extends FriendRequest {
    friendshipId: string;
    relationshipId: string;
    profileDpUrl: string;
}

export interface AcceptedFriendDetails {
    friendUserId: string;
    friendshipId: string;
    relationshipId: string;
    friendName: string;
    friendDpImgUrl: string;
}

export enum FriendRequestStatus {
    REQUESTED = 'requested',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

export enum GroupSubType {
    CREATED = 'created',
    MEMBER_ADDED = 'memberAdded'
}

export enum FriendStatus {
    ACTIVE = 'active',
    INACTIVE = 'inActive'
}

export interface QueuePayload {
    type: QueuePayloadType;
    subType: FriendRequestStatus | GroupSubType | any;
    payload: any
}

export enum QueuePayloadType {
    GROUP = 'group',
    FRIEND_REQUEST = 'friendRequest'
}

export interface FriendDetails {
    id: string;
    userName: string;
    email: string;
}


