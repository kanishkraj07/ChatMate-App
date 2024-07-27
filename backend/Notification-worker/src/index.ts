import express from 'express';
import { createClient, RedisClientType } from 'redis';
import { NotificationEventType, NotificationEvent, GroupNotificationEventType, FriendRequestNotificationEventType, NotificationType, NotificationPayload } from './model/notification';
import {v4 as uuidV4} from 'uuid';
import { GlobalNotification, PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

const app = express();
const NOTIFICATION_WORKER_QUEUE = 'Notification_Queue';

dotenv.config({path:  path.resolve('../.env')});

const redisClient: RedisClientType = createClient();
const prismaClient: PrismaClient = new PrismaClient();

const startRedisServer = async() => {
    try {
        await redisClient.connect();
        app.listen(process.env.NOTIFICATION_WORKER_PORT || 9000);
        processWorker();
    } catch(e) {
        console.log('Error connecting with redis server', e);
    }
}

const processWorker = async () => {

    while(1) {
        const response = await redisClient.brPop(NOTIFICATION_WORKER_QUEUE, 0);
    if(response && response.element) {
        const event = JSON.parse(response.element);
        switch(event.type) {
            case NotificationEventType.GROUP: groupNotificationHandler(event);
                                              break;

            case NotificationEventType.FRIEND_REQUEST: frNotificationHandler(event);
                                                       break;
                                                        
            default: break;
        }
    }
    }
}

const groupNotificationHandler = async(event) => {
    const notificationId = uuidV4();
    const groupName = event.payload.groupName;
    const toUserId = event.payload.toUserId;
    const userGlobalNotificationDetails: GlobalNotification = await manageUserGlobalNotification(toUserId);
    let notificationEvent: NotificationEvent = {} as NotificationEvent;
    
    // if(event.subType === 'created') {
    //     const message: string = `You have created a new group ${groupName}`;
    //     const notificationPayload: NotificationPayload = generateNotificationPayload(GroupNotificationEventType.CREATED, notificationId, message);
    //     await updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.GROUP, GroupNotificationEventType.CREATED, message)
    //     notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.GROUP, notificationPayload);
    // }

    if(event.subType === 'memberAdded') {
        const message: string = `You have been added in a ${groupName} Group`;
        const notificationPayload: NotificationPayload = generateNotificationPayload(GroupNotificationEventType.MEMBER_ADDED, notificationId, message, event.payload.iconUrl);
        await updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.GROUP, GroupNotificationEventType.MEMBER_ADDED, message)
        notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.GROUP, notificationPayload);
    }
    await redisClient.publish(`notification:${toUserId}`, JSON.stringify(notificationEvent))
}

const frNotificationHandler = async (event) => {
    const notificationId: string = uuidV4();  
    let notificationEvent: NotificationEvent = {} as NotificationEvent;

    const userGlobalNotificationDetails: GlobalNotification = await manageUserGlobalNotification(event.payload.toUserId);
    
    const response = await prismaClient.user.findFirst({

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

   const fromUserName: string = retrieveName(response as User);
    
    if(event.subType === 'requested') {
       const message: string = `You got a friend request from ${fromUserName}`;
       const notificationPayload: NotificationPayload = generateNotificationPayload(FriendRequestNotificationEventType.REQUESTED, notificationId, message, event.payload.profileDpUrl);
       updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.FRIEND_REQUEST, FriendRequestNotificationEventType.REQUESTED, message)
       notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.FRIEND_REQUEST, notificationPayload, JSON.stringify({fromUserId: event.payload.fromUserId, friendRequestId: event.payload.friendRequestId})); 
    }

    if(event.subType === 'accepted') {
        const message: string = `${fromUserName} accepted your friend request`;
        const notificationPayload: NotificationPayload  = generateNotificationPayload(FriendRequestNotificationEventType.REQUEST_ACCEPTED, notificationId, message, event.payload.profileDpUrl);
        updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.FRIEND_REQUEST, FriendRequestNotificationEventType.REQUEST_ACCEPTED, message)
        notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.FRIEND_REQUEST, notificationPayload);
     }

     if(event.subType === 'rejected') {
        const message: string = `${fromUserName} rejected your friend request`;
        const notificationPayload: NotificationPayload = generateNotificationPayload(FriendRequestNotificationEventType.REQUEST_REJECTED, notificationId, message, event.payload.profileDpUrl);
        updateNotificationDetails(notificationId, userGlobalNotificationDetails.id, NotificationEventType.FRIEND_REQUEST, FriendRequestNotificationEventType.REQUEST_REJECTED, message)
        notificationEvent = generateNotificationEvent(NotificationType.NOTFICATION, NotificationEventType.FRIEND_REQUEST, notificationPayload);
     }

   await redisClient.publish(`notification:${event.payload.toUserId}`, JSON.stringify(notificationEvent))
}

const updateNotificationDetails = async(notificationId: string, userGlobalNotificationId: string, type: NotificationEventType, subType: GroupNotificationEventType | FriendRequestNotificationEventType, message: string): Promise<void> => {
    await prismaClient.notificationDetails.create({
        data: {
            id: notificationId,
            userNotificationId: userGlobalNotificationId,
            sentTime: new Date(),
            type,
            subType,
            message
        }
    }); 
}

const manageUserGlobalNotification = async(userId: string): Promise<GlobalNotification> => {
    
    let userGlobalNotificationDetails: GlobalNotification = {} as GlobalNotification;
    
   const response = await prismaClient.globalNotification.findFirst({
        where: {
            userId
        }
       });
    
    
       if(!response) {
       userGlobalNotificationDetails = await prismaClient.globalNotification.create({
            data: {
                id: uuidV4(),
                userId
            }
        })
       } else {
        const res = await prismaClient.globalNotification.update({
            where: {
                userId
            },
            data: {
                totalCount: {
                    increment: 1
                }
            }
        })
        userGlobalNotificationDetails = res;
    }

    return userGlobalNotificationDetails;
}

const generateNotificationPayload = (ref: GroupNotificationEventType | FriendRequestNotificationEventType, notificationId: string, message: string, imageUrl?: string): NotificationPayload => {
    return {
        ref,
        notificationId,
        message,
        imageUrl,
        sentTime: new Date()
    } as NotificationPayload
}

const generateNotificationEvent = (type: NotificationType, subType: NotificationEventType, payload: NotificationPayload, metadata?: string): NotificationEvent => {
    return {
        type,
        subType,
        payload,
        metadata
    } as NotificationEvent
}

const retrieveName = (userDetails: User): string => {
    if(userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`
    }
    if(userDetails.userName) {
        return userDetails.userName;
    }

    if(userDetails.firstName) {
        return `${userDetails.firstName}`
    }
    return userDetails.email;
}


(async() => startRedisServer())();