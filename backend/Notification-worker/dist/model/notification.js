"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestNotificationEventType = exports.GroupNotificationEventType = exports.NotificationEventType = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["NOTFICATION"] = "notification";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationEventType;
(function (NotificationEventType) {
    NotificationEventType["GROUP"] = "group";
    NotificationEventType["FRIEND_REQUEST"] = "friendRequest";
})(NotificationEventType || (exports.NotificationEventType = NotificationEventType = {}));
var GroupNotificationEventType;
(function (GroupNotificationEventType) {
    GroupNotificationEventType["CREATED"] = "created";
    GroupNotificationEventType["MEMBER_ADDED"] = "memberAdded";
})(GroupNotificationEventType || (exports.GroupNotificationEventType = GroupNotificationEventType = {}));
var FriendRequestNotificationEventType;
(function (FriendRequestNotificationEventType) {
    FriendRequestNotificationEventType["REQUESTED"] = "requested";
    FriendRequestNotificationEventType["REQUEST_ACCEPTED"] = "accepted";
    FriendRequestNotificationEventType["REQUEST_REJECTED"] = "rejected";
})(FriendRequestNotificationEventType || (exports.FriendRequestNotificationEventType = FriendRequestNotificationEventType = {}));
