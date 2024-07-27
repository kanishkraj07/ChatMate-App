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
const auth_1 = require("../middlewares/auth");
const group_1 = require("../models/group");
const group_2 = require("../schemas/group");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const user_1 = require("../models/user");
const RedisClient_1 = __importDefault(require("../RedisClient"));
const extractName_1 = require("../utils/extractName");
const multer_1 = __importDefault(require("multer"));
const S3ClientManager_1 = __importDefault(require("../S3ClientManager"));
const groupRouter = express_1.default.Router();
const prismaClient = new client_1.PrismaClient();
const fileUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
groupRouter.post('/create', auth_1.authValidator, fileUpload.single('Group_Icon'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!group_2.NEW_GROUP_REQUEST.safeParse(req.body).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }
    const allMembers = req.body.members;
    const newGroupPayload = {
        ownerId: req.body.ownerId,
        name: req.body.name,
        members: (allMembers === null || allMembers === void 0 ? void 0 : allMembers.includes(', ')) ? allMembers.split(", ") : allMembers ? [allMembers] : []
    };
    const newGroupId = (0, uuid_1.v4)();
    const createdAt = new Date();
    const addMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: `Group_Icon:${newGroupId}`,
        bufferData: (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer,
        contentType: (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype
    };
    const getMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: `Group_Icon:${newGroupId}`,
    };
    yield S3ClientManager_1.default.getInstance().addMedia(addMediaParams);
    const groupIconUrl = yield S3ClientManager_1.default.getInstance().getMedia(getMediaParams);
    const newGroup = {
        id: newGroupId,
        name: newGroupPayload.name,
        ownerId: newGroupPayload.ownerId,
        iconUrl: `Group_Icon:${newGroupId}`,
        createdAt: createdAt,
        memberCount: (_c = newGroupPayload === null || newGroupPayload === void 0 ? void 0 : newGroupPayload.members) === null || _c === void 0 ? void 0 : _c.length,
    };
    let members = [];
    const userGroupMembers = yield Promise.all(newGroupPayload.members.map((userId) => __awaiter(void 0, void 0, void 0, function* () {
        const id = (0, uuid_1.v4)();
        const response = yield prismaClient.user.findFirst({
            where: {
                id: userId
            },
            select: {
                userName: true,
                email: true
            }
        });
        members.push({ memberId: id, userId, userName: response === null || response === void 0 ? void 0 : response.userName, email: response === null || response === void 0 ? void 0 : response.email });
        return {
            id,
            userId,
            groupId: newGroupId,
            isOwner: userId === newGroupPayload.ownerId,
            joinedDate: createdAt,
            notificationCount: 1,
            status: group_1.UserGroupStatus.JOINED
        };
    })));
    const response = yield prismaClient.group.create({
        data: Object.assign(Object.assign({}, newGroup), { members: {
                createMany: {
                    data: []
                }
            } }),
        select: {
            user: {
                select: {
                    userName: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });
    yield prismaClient.userGroup.createMany({
        data: [...userGroupMembers]
    });
    const payload = { groupName: newGroup.name, toUserId: newGroup.ownerId, iconUrl: groupIconUrl };
    const notificationPayload = getNotificationPayload(user_1.QueuePayloadType.GROUP, user_1.GroupSubType.CREATED, payload);
    RedisClient_1.default.getInstance().pushEvent(user_1.NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
    const addMembersPayload = {
        groupId: newGroupId,
        groupName: newGroup.name,
        ownerId: newGroup.ownerId,
        ownerName: (0, extractName_1.extractName)(response === null || response === void 0 ? void 0 : response.user),
        members: members,
        iconUrl: groupIconUrl,
        addedAt: createdAt
    };
    yield addMembers(addMembersPayload);
    res.status(200).json({
        groupDetails: addMembersPayload
    });
}));
const addMembers = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const groupPublishPayload = {
        type: user_1.QueuePayloadType.GROUP,
        subType: user_1.GroupSubType.MEMBER_ADDED,
        payload: data
    };
    yield Promise.all(data.members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
        yield RedisClient_1.default.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupPublishPayload));
        const payload = { toUserId: member.userId, groupName: data.groupName, iconUrl: data.iconUrl };
        const notificationPayload = getNotificationPayload(user_1.QueuePayloadType.GROUP, user_1.GroupSubType.MEMBER_ADDED, payload);
        yield RedisClient_1.default.getInstance().pushEvent(user_1.NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
    })));
});
const getNotificationPayload = (type, subType, payload) => {
    return {
        type,
        subType,
        payload
    };
};
exports.default = groupRouter;
