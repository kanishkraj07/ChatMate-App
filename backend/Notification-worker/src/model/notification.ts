
export enum NotificationType {
    NOTFICATION = 'notification'
}

export interface NotificationEvent {
    type: NotificationType;
    subType: NotificationEventType;
    payload: NotificationPayload;
    metadata?: string
}

export interface NotificationPayload {
    ref:  GroupNotificationEventType | FriendRequestNotificationEventType;
    notificationId: string;
    message: string;
    sentTime: Date;
    imageUrl?: string;
}

export enum NotificationEventType {
    GROUP = 'group',
    FRIEND_REQUEST = 'friendRequest'
}

export enum GroupNotificationEventType {
    CREATED = 'created',
    MEMBER_ADDED = 'memberAdded',
}

export enum FriendRequestNotificationEventType {
    REQUESTED = 'requested',
    REQUEST_ACCEPTED = 'accepted',
    REQUEST_REJECTED = 'rejected'
}