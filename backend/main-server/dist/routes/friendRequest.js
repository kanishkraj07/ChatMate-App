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
const user_1 = require("../schemas/user");
const client_1 = require("@prisma/client");
const user_2 = require("../models/user");
const uuid_1 = require("uuid");
const RedisClient_1 = __importDefault(require("../RedisClient"));
const extractName_1 = require("../utils/extractName");
const S3ClientManager_1 = __importDefault(require("../S3ClientManager"));
const friendRequestRouter = express_1.default.Router();
const prismaClient = new client_1.PrismaClient();
friendRequestRouter.post('/requested', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friendRequest = req.body;
    if (!user_1.FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }
    const toUser = yield prismaClient.user.findFirst({
        where: {
            id: friendRequest.toUserId
        }
    });
    if (!toUser) {
        res.status(400).json({
            message: `No user exist with userId: ${friendRequest.toUserId}`
        });
        return;
    }
    const friendRequestId = (0, uuid_1.v4)();
    yield prismaClient.friendRequest.create({
        data: {
            id: friendRequestId,
            userId: friendRequest.fromUserId,
            toUserId: friendRequest.toUserId,
            status: user_2.FriendRequestStatus.REQUESTED,
            sentTime: new Date()
        }
    });
    const fromUserDetails = yield prismaClient.user.findFirst({
        where: {
            id: friendRequest.fromUserId
        },
        select: {
            profileImgUrl: true
        }
    });
    const imgUrl = yield getProfileImgUrl(`PROFILE_DP:${friendRequest.fromUserId}`);
    friendRequest.friendRequestId = friendRequestId;
    const payload = Object.assign(Object.assign({}, friendRequest), { profileDpUrl: imgUrl });
    const friendRequestQueuePayload = {
        type: user_2.QueuePayloadType.FRIEND_REQUEST,
        subType: user_2.FriendRequestStatus.REQUESTED,
        payload
    };
    yield RedisClient_1.default.getInstance().publish(`friendRequest:${friendRequest.toUserId}`, JSON.stringify(friendRequestQueuePayload));
    yield RedisClient_1.default.getInstance().pushEvent(user_2.NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));
    res.status(200).json({
        message: 'Request Sent successfully'
    });
}));
friendRequestRouter.post('/accepted', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friendRequest = req.body;
    if (!user_1.FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'Incorrect Inputs'
        });
        return;
    }
    const friendRequestDetails = yield prismaClient.friendRequest.findFirst({
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
    if (!(friendRequestDetails === null || friendRequestDetails === void 0 ? void 0 : friendRequestDetails.user)) {
        res.status(400).json({
            message: `User with userId: ${friendRequest.toUserId} does not exist`
        });
        return;
    }
    if ((friendRequestDetails === null || friendRequestDetails === void 0 ? void 0 : friendRequestDetails.status) !== user_2.FriendRequestStatus.REQUESTED) {
        res.status(400).json({
            message: `User with userId: ${friendRequest.toUserId} does not requested you to be a friend`
        });
        return;
    }
    const toFriendId = (0, uuid_1.v4)();
    const fromFriendId = (0, uuid_1.v4)();
    const relationshipId = (0, uuid_1.v4)();
    const becameFriendAt = new Date();
    yield prismaClient.friendRequest.update({
        where: {
            id: friendRequest.friendRequestId,
            userId: friendRequest.toUserId,
            toUserId: friendRequest.fromUserId
        },
        data: {
            status: user_2.FriendRequestStatus.ACCEPTED
        }
    });
    yield prismaClient.friend.createMany({
        data: [{
                id: toFriendId,
                friendId: friendRequest.toUserId,
                becameFriendAt,
                status: user_2.FriendStatus.ACTIVE
            }, {
                id: fromFriendId,
                friendId: friendRequest.fromUserId,
                becameFriendAt,
                status: user_2.FriendStatus.ACTIVE
            }]
    });
    yield prismaClient.relationship.create({
        data: {
            id: relationshipId,
            status: user_2.FriendStatus.ACTIVE,
        }
    });
    const fromFriendshipId = (0, uuid_1.v4)();
    const toFriendshipId = (0, uuid_1.v4)();
    yield prismaClient.friendsOnUser.createMany({
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
    const fromUserDetails = yield prismaClient.user.findFirst({
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
    const toUserDetails = yield prismaClient.user.findFirst({
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
    const fromUserName = (0, extractName_1.extractName)(fromUserDetails);
    const toUserName = (0, extractName_1.extractName)(toUserDetails);
    const fromUserDpImgUrl = yield getProfileImgUrl(`PROFILE_DP:${fromUserDetails === null || fromUserDetails === void 0 ? void 0 : fromUserDetails.profileImgUrl}`);
    const toUserDpImgUrl = yield getProfileImgUrl(`PROFILE_DP:${toUserDetails === null || toUserDetails === void 0 ? void 0 : toUserDetails.profileImgUrl}`);
    const friendRequestQueuePayload = {
        type: user_2.QueuePayloadType.FRIEND_REQUEST,
        subType: user_2.FriendRequestStatus.ACCEPTED,
        payload: Object.assign(Object.assign({}, friendRequest), { profileDpUrl: fromUserDpImgUrl, friendshipId: toFriendshipId, relationshipId })
    };
    const acceptedFriendReqPayload = {
        type: user_2.QueuePayloadType.FRIEND_REQUEST,
        subType: user_2.FriendRequestStatus.ACCEPTED,
        payload: { friendName: fromUserName, friendUserId: friendRequest.fromUserId, relationshipId, friendshipId: toFriendshipId, friendDpImgUrl: fromUserDpImgUrl }
    };
    yield RedisClient_1.default.getInstance().publish(`friendRequest:${friendRequest.toUserId}`, JSON.stringify(acceptedFriendReqPayload));
    yield RedisClient_1.default.getInstance().pushEvent(user_2.NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));
    res.status(200).json({
        friendshipDetails: { friendName: toUserName, friendUserId: friendRequest.toUserId, relationshipId, friendshipId: fromFriendshipId, friendDpImgUrl: toUserDpImgUrl }
    });
}));
friendRequestRouter.post('/rejected', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friendRequest = req.body;
    if (!user_1.FRIEND_REQUEST.safeParse(friendRequest).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }
    const friendRequestDetails = yield prismaClient.friendRequest.findFirst({
        where: {
            id: friendRequest.friendRequestId
        }
    });
    if (!friendRequestDetails) {
        res.status(400).json({
            message: `No record found with friendRequestId: ${friendRequest.friendRequestId}`
        });
        return;
    }
    const fromUserDetails = yield prismaClient.user.findFirst({
        where: {
            id: friendRequest.fromUserId
        },
        select: {
            profileImgUrl: true
        }
    });
    yield prismaClient.friendRequest.update({
        where: {
            id: friendRequest.friendRequestId
        },
        data: {
            status: user_2.FriendRequestStatus.REJECTED
        }
    });
    const fromUserDpImgUrl = yield getProfileImgUrl(`PROFILE_DP:${fromUserDetails === null || fromUserDetails === void 0 ? void 0 : fromUserDetails.profileImgUrl}`);
    const payload = Object.assign(Object.assign({}, friendRequest), { profileDpUrl: fromUserDpImgUrl });
    const friendRequestQueuePayload = {
        type: user_2.QueuePayloadType.FRIEND_REQUEST,
        subType: user_2.FriendRequestStatus.REJECTED,
        payload: payload
    };
    yield RedisClient_1.default.getInstance().pushEvent(user_2.NOTIFICATION_QUEUE, JSON.stringify(friendRequestQueuePayload));
    res.status(200).json({
        message: 'Rejection Successfull'
    });
}));
const getProfileImgUrl = (unqName) => __awaiter(void 0, void 0, void 0, function* () {
    const getMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: unqName,
    };
    const url = yield S3ClientManager_1.default.getInstance().getMedia(getMediaParams);
    return url;
});
exports.default = friendRequestRouter;
