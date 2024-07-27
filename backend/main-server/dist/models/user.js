"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuePayloadType = exports.FriendStatus = exports.GroupSubType = exports.FriendRequestStatus = exports.NOTIFICATION_QUEUE = void 0;
exports.NOTIFICATION_QUEUE = 'Notification_Queue';
var FriendRequestStatus;
(function (FriendRequestStatus) {
    FriendRequestStatus["REQUESTED"] = "requested";
    FriendRequestStatus["ACCEPTED"] = "accepted";
    FriendRequestStatus["REJECTED"] = "rejected";
})(FriendRequestStatus || (exports.FriendRequestStatus = FriendRequestStatus = {}));
var GroupSubType;
(function (GroupSubType) {
    GroupSubType["CREATED"] = "created";
    GroupSubType["MEMBER_ADDED"] = "memberAdded";
})(GroupSubType || (exports.GroupSubType = GroupSubType = {}));
var FriendStatus;
(function (FriendStatus) {
    FriendStatus["ACTIVE"] = "active";
    FriendStatus["INACTIVE"] = "inActive";
})(FriendStatus || (exports.FriendStatus = FriendStatus = {}));
var QueuePayloadType;
(function (QueuePayloadType) {
    QueuePayloadType["GROUP"] = "group";
    QueuePayloadType["FRIEND_REQUEST"] = "friendRequest";
})(QueuePayloadType || (exports.QueuePayloadType = QueuePayloadType = {}));
