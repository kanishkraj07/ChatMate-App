import express from 'express';
import { FRIEND_REQUEST } from '../schemas/user';
import { PrismaClient } from '@prisma/client';
import { AcceptedFriendDetails, AcceptedFriendReqPayload, FriendRequest, FriendRequestStatus, FriendStatus, NOTIFICATION_QUEUE, QueuePayload, QueuePayloadType } from '../models/user';
import { v4 as uuidV4} from 'uuid';
import RedisClient from '../RedisClient';
import { extractName } from '../utils/extractName';
import S3CLientManager, { GetMediaParams } from '../S3ClientManager';

const friendRequestRouter = express.Router();

const prismaClient = new PrismaClient();

friendRequestRouter.post('/requested', async(req, res) => {

    const friendRequest: FriendRequest = req.body;
    if(!FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }

   const toUser = await prismaClient.user.findFirst({
        where: {
            id: friendRequest.toUserId
        }
    });

    if(!toUser) {
        res.status(400).json({
            message: `No user exist with userId: ${friendRequest.toUserId}`
        });
        return;
    }

    const friendRequestId: string = uuidV4();
    
    await prismaClient.friendRequest.create({
        data: {
            id: friendRequestId,
            userId: friendRequest.fromUserId,
            toUserId: friendRequest.toUserId,
            status: FriendRequestStatus.REQUESTED,
            sentTime: new Date()
        }
    });

    const fromUserDetails =  await prismaClient.user.findFirst({
        where: {
            id: friendRequest.fromUserId
        },
        select: {
            profileImgUrl: true
        }
    });

    const imgUrl = await getProfileImgUrl(`PROFILE_DP:${friendRequest.fromUserId}`)
    
    friendRequest.friendRequestId = friendRequestId;
    
    const payload = {
        ...friendRequest,
        profileDpUrl: imgUrl
    }

    const friendRequestQueuePayload: QueuePayload = {
        type: QueuePayloadType.FRIEND_REQUEST,
        subType: FriendRequestStatus.REQUESTED,
        payload
    } as QueuePayload


    await RedisClient.getInstance().publish(`friendRequest:${friendRequest.toUserId}`, JSON.stringify(friendRequestQueuePayload));

    await RedisClient.getInstance().pushEvent(NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));

    res.status(200).json({
        message: 'Request Sent successfully'
    });
});

friendRequestRouter.post('/accepted', async(req, res) => {
    const friendRequest: FriendRequest = req.body;

    if(!FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'Incorrect Inputs'
        });
        return;
    }

    const friendRequestDetails = await prismaClient.friendRequest.findFirst({
        where: {
            userId: friendRequest.toUserId,
            toUserId: friendRequest.fromUserId
        },
        select: {
            id: true,
            user: true,
            status: true
        }
    });

    if(!friendRequestDetails?.user) {
        res.status(400).json({
            message: `User with userId: ${friendRequest.toUserId} does not exist`
        });
        return;
    }

    if(friendRequestDetails?.status !== FriendRequestStatus.REQUESTED) {
        res.status(400).json({
            message: `User with userId: ${friendRequest.toUserId} does not requested you to be a friend`
        })
        return;
    }

    const toFriendId: string = uuidV4();
    const fromFriendId: string = uuidV4();
    const relationshipId: string = uuidV4();
    const becameFriendAt: Date = new Date();

    await prismaClient.friendRequest.update({
        where: {
            id: friendRequest.friendRequestId,
            userId: friendRequest.toUserId,
            toUserId: friendRequest.fromUserId
        },
        data: {
            status: FriendRequestStatus.ACCEPTED
        }
    });


        await prismaClient.friend.createMany({
            data: [{
                id: toFriendId,
                friendId: friendRequest.toUserId,
                becameFriendAt,
                status: FriendStatus.ACTIVE
            }, {
                id: fromFriendId,
                friendId: friendRequest.fromUserId,
                becameFriendAt,
                status: FriendStatus.ACTIVE
            }]
        });

        await prismaClient.relationship.create({
            data: {
                id: relationshipId,
                status: FriendStatus.ACTIVE,
            }
        });

        const fromFriendshipId: string = uuidV4();
        const toFriendshipId: string = uuidV4();


  await prismaClient.friendsOnUser.createMany({
        data: [{
            id: fromFriendshipId,
            userId: friendRequest.fromUserId,
            friendId: toFriendId,
            relationshipId
        }, 
        {
            id: toFriendshipId,
            userId: friendRequest.toUserId,
            friendId: fromFriendId,
            relationshipId
        }]

    });

    const fromUserDetails = await prismaClient.user.findFirst({
        where: {
            id: friendRequest.fromUserId
        },

        select: {
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
            profileImgUrl: true
        }
    });

    const toUserDetails = await prismaClient.user.findFirst({
        where: {
            id: friendRequest.toUserId
        },

        select: {
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
            profileImgUrl: true
        }
    });

    const fromUserName: string = extractName(fromUserDetails);
    const toUserName: string = extractName(toUserDetails);

    const fromUserDpImgUrl: string = await getProfileImgUrl(`PROFILE_DP:${fromUserDetails?.profileImgUrl}`)

    const toUserDpImgUrl: string = await getProfileImgUrl(`PROFILE_DP:${toUserDetails?.profileImgUrl}`)

    const friendRequestQueuePayload: QueuePayload = {
        type: QueuePayloadType.FRIEND_REQUEST,
        subType: FriendRequestStatus.ACCEPTED,
        payload: {...friendRequest, profileDpUrl: fromUserDpImgUrl, friendshipId: toFriendshipId, relationshipId } as AcceptedFriendReqPayload
    } as QueuePayload

    const acceptedFriendReqPayload: QueuePayload = {
        type: QueuePayloadType.FRIEND_REQUEST,
        subType: FriendRequestStatus.ACCEPTED,
        payload: {friendName: fromUserName, friendUserId: friendRequest.fromUserId, relationshipId, friendshipId: toFriendshipId, friendDpImgUrl: fromUserDpImgUrl } as AcceptedFriendDetails
    } as QueuePayload

    await RedisClient.getInstance().publish(`friendRequest:${friendRequest.toUserId}`, JSON.stringify(acceptedFriendReqPayload));

    await RedisClient.getInstance().pushEvent(NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));

    res.status(200).json({
        friendshipDetails: {friendName: toUserName, friendUserId: friendRequest.toUserId, relationshipId, friendshipId: fromFriendshipId, friendDpImgUrl: toUserDpImgUrl} as AcceptedFriendDetails
    });
});

friendRequestRouter.post('/rejected', async(req, res) => {
    const friendRequest: FriendRequest = req.body;
    if(!FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }

   const friendRequestDetails = await prismaClient.friendRequest.findFirst({
        where: {
            id: friendRequest.friendRequestId
        }
    });

    if(!friendRequestDetails) {
        res.status(400).json({
            message: `No record found with friendRequestId: ${friendRequest.friendRequestId}`
        });
        return;
    }

  const fromUserDetails = await prismaClient.user.findFirst({
        where: {
            id: friendRequest.fromUserId
        },
        select: {
            profileImgUrl: true
        }
    });

    await prismaClient.friendRequest.update({
        where: {
            id: friendRequest.friendRequestId
        },
        data: {
            status: FriendRequestStatus.REJECTED
        }
    });

    const fromUserDpImgUrl: string = await getProfileImgUrl(`PROFILE_DP:${fromUserDetails?.profileImgUrl}`)

    const payload = {
        ...friendRequest,
        profileDpUrl: fromUserDpImgUrl
    }

    const friendRequestQueuePayload: QueuePayload = {
        type: QueuePayloadType.FRIEND_REQUEST,
        subType: FriendRequestStatus.REJECTED,
        payload: payload
    } as QueuePayload

    await RedisClient.getInstance().pushEvent(NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));

    res.status(200).json({
        message: 'Rejection Successfull'
    });
});

const getProfileImgUrl = async (unqName: string) => {
    const getMediaParams: GetMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: unqName,
    } as GetMediaParams
  
    const url = await S3CLientManager.getInstance().getMedia(getMediaParams);
    return url;
} 

export default friendRequestRouter;