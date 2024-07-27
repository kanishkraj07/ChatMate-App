"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const notification_1 = require("./model/notification");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const NOTIFICATION_WORKER_QUEUE = 'Notification_Queue';
dotenv_1.default.config({ path: path_1.default.resolve('../.env') });
const redisClient = (0, redis_1.createClient)();
const prismaClient = new client_1.PrismaClient();
const startRedisServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
        app.listen(process.env.NOTIFICATION_WORKER_PORT || 9000);
        processWorker();
    }
    catch (e) {
        console.log('Error connecting with redis server', e);
    }
});
const processWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    while (1) {
        const response = yield redisClient.brPop(NOTIFICATION_WORKER_QUEUE, 0);
        if (response && response.element) {
            const event = JSON.parse(response.element);
            switch (event.type) {
                case notification_1.NotificationEventType.GROUP:
                    groupNotificationHandler(event);
                    break;
                case notification_1.NotificationEventType.FRIEND_REQUEST:
                    frNotificationHandler(event);
                    break;
                default: break;
            }
        }
    }
});
const groupNotificationHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationId = (0, uuid_1.v4)();
    const groupName = event.payload.groupName;
    const toUserId = event.payload.toUserId;
    const userGlobalNotificationDetails = yield manageUserGlobalNotification(toUserId);
    let notificationEvent = {};
    // if(event.subType === 'created') {
    //     const message: string = `You have created a new group ${groupName}`;
    //     const notificationPayload: NotificationPayload = generateNotificationPayload(GroupNotificationEventType.CREATED, notificationId, message);
    //     await updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.GROUP, GroupNotificationEventType.CREATED, message)
    //     notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.GROUP, notificationPayload);
    // }
    if (event.subType === 'memberAdded') {
        const message = `You have been added in a ${groupName} Group`;
        const notificationPayload = generateNotificationPayload(notification_1.GroupNotificationEventType.MEMBER_ADDED, notificationId, message, event.payload.iconUrl);
        yield updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, notification_1.NotificationEventType.GROUP, notification_1.GroupNotificationEventType.MEMBER_ADDED, message);
        notificationEvent = generateNotificationEvent(notification_1.NotificationType.NOTFICATION, notification_1.NotificationEventType.GROUP, notificationPayload);
    }
    yield redisClient.publish(`notification:${toUserId}`, JSON.stringify(notificationEvent));
});
const frNotificationHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationId = (0, uuid_1.v4)();
    let notificationEvent = {};
    const userGlobalNotificationDetails = yield manageUserGlobalNotification(event.payload.toUserId);
    const response = yield prismaClient.user.findFirst({
        where: {
            id: event.payload.fromUserId
        },
        select: {
            firstName: true,
            lastName: true,
            userName: true,
            email: true
        }
    });
    const fromUserName = retrieveName(response);
    if (event.subType === 'requested') {
        const message = `You got a friend request from ${fromUserName}`;
        const notificationPayload = generateNotificationPayload(notification_1.FriendRequestNotificationEventType.REQUESTED, notificationId, message, event.payload.profileDpUrl);
        updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, notification_1.NotificationEventType.FRIEND_REQUEST, notification_1.FriendRequestNotificationEventType.REQUESTED, message);
        notificationEvent = generateNotificationEvent(notification_1.NotificationType.NOTFICATION, notification_1.NotificationEventType.FRIEND_REQUEST, notificationPayload, JSON.stringify({ fromUserId: event.payload.fromUserId, friendRequestId: event.payload.friendRequestId }));
    }
    if (event.subType === 'accepted') {
        const message = `${fromUserName} accepted your friend request`;
        const notificationPayload = generateNotificationPayload(notification_1.FriendRequestNotificationEventType.REQUEST_ACCEPTED, notificationId, message, event.payload.profileDpUrl);
        updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, notification_1.NotificationEventType.FRIEND_REQUEST, notification_1.FriendRequestNotificationEventType.REQUEST_ACCEPTED, message);
        notificationEvent = generateNotificationEvent(notification_1.NotificationType.NOTFICATION, notification_1.NotificationEventType.FRIEND_REQUEST, notificationPayload);
    }
    if (event.subType === 'rejected') {
        const message = `${fromUserName} rejected your friend request`;
        const notificationPayload = generateNotificationPayload(notification_1.FriendRequestNotificationEventType.REQUEST_REJECTED, notificationId, message, event.payload.profileDpUrl);
        updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, notification_1.NotificationEventType.FRIEND_REQUEST, notification_1.FriendRequestNotificationEventType.REQUEST_REJECTED, message);
        notificationEvent = generateNotificationEvent(notification_1.NotificationType.NOTFICATION, notification_1.NotificationEventType.FRIEND_REQUEST, notificationPayload);
    }
    yield redisClient.publish(`notification:${event.payload.toUserId}`, JSON.stringify(notificationEvent));
});
const updateNotificationDetails = (notificationId, userGlobalNotificationId, type, subType, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient.notificationDetails.create({
        data: {
            id: notificationId,
            userNotificationId: userGlobalNotificationId,
            sentTime: new Date(),
            type,
            subType,
            message
        }
    });
});
const manageUserGlobalNotification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    let userGlobalNotificationDetails = {};
    const response = yield prismaClient.globalNotification.findFirst({
        where: {
            userId
        }
    });
    if (!response) {
        userGlobalNotificationDetails = yield prismaClient.globalNotification.create({
            data: {
                id: (0, uuid_1.v4)(),
                userId
            }
        });
    }
    else {
        const res = yield prismaClient.globalNotification.update({
            where: {
                userId
            },
            data: {
                totalCount: {
                    increment: 1
                }
            }
        });
        userGlobalNotificationDetails = res;
    }
    return userGlobalNotificationDetails;
});
const generateNotificationPayload = (ref, notificationId, message, imageUrl) => {
    return {
        ref,
        notificationId,
        message,
        imageUrl,
        sentTime: new Date()
    };
};
const generateNotificationEvent = (type, subType, payload, metadata) => {
    return {
        type,
        subType,
        payload,
        metadata
    };
};
const retrieveName = (userDetails) => {
    if (userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`;
    }
    if (userDetails.userName) {
        return userDetails.userName;
    }
    if (userDetails.firstName) {
        return `${userDetails.firstName}`;
    }
    return userDetails.email;
};
(() => __awaiter(void 0, void 0, void 0, function* () { return startRedisServer(); }))();
