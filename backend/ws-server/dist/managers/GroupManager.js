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
const client_1 = require("@prisma/client");
const Groups_1 = require("../models/Groups");
const uuid_1 = require("uuid");
const RedisClientManager_1 = __importDefault(require("./RedisClientManager"));
const UserManager_1 = __importDefault(require("./UserManager"));
const Chats_1 = require("../models/Chats");
const NotificationManager_1 = __importDefault(require("./NotificationManager"));
const ws_message_1 = require("../models/ws_message");
class GroupManager {
    constructor() {
        this.prismaClient = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new GroupManager();
        }
        return this.instance;
    }
    createGroup(newGroupPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            const newGroupId = (0, uuid_1.v4)();
            const createdAt = new Date();
            const newGroup = {
                id: newGroupId,
                name: newGroupPayload.name,
                ownerId: newGroupPayload.ownerId,
                createdAt: createdAt,
                memberCount: newGroupPayload.members.length,
            };
            let members = [];
            const userGroupMembers = newGroupPayload.members.map((userId) => {
                const id = (0, uuid_1.v4)();
                members.push({ memberId: id, userId });
                return {
                    id,
                    userId: userId,
                    groupId: newGroupId,
                    isOwner: userId === newGroupPayload.ownerId,
                    joinedDate: createdAt,
                    status: Groups_1.UserGroupStatus.JOINED
                };
            });
            const response = yield this.prismaClient.group.create({
                data: Object.assign(Object.assign({}, newGroup), { members: {
                        createMany: {
                            data: userGroupMembers
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
            const payload = { groupName: newGroup.name, toUserId: newGroup.ownerId };
            const notificationPayload = NotificationManager_1.default.getInstance().getNotificationPayload(Chats_1.MessageType.GROUP, Groups_1.GroupPublishSubType.CREATED, payload);
            RedisClientManager_1.default.getInstance().push(ws_message_1.NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
            const addMembersPayload = {
                groupId: newGroupId,
                groupName: newGroup.name,
                ownerId: newGroup.ownerId,
                ownerName: this.getOwnerName(response.user),
                members: members,
                addedAt: createdAt
            };
            this.addMembers(addMembersPayload);
        });
    }
    addMembers(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userGroupMap = UserManager_1.default.getInstance().getUserGroupMap();
            const currentMembers = userGroupMap.get(data.groupId);
            if (currentMembers === null || currentMembers === void 0 ? void 0 : currentMembers.length) {
                userGroupMap.set(data.groupId, [...currentMembers, ...data.members]);
            }
            else {
                userGroupMap.set(data.groupId, [...data.members]);
            }
            const groupPublishPayload = {
                type: 'group',
                subType: Groups_1.GroupPublishSubType.MEMBER_ADDED,
                payload: data
            };
            data.members.forEach((member) => __awaiter(this, void 0, void 0, function* () {
                yield RedisClientManager_1.default.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupPublishPayload));
                const payload = { groupName: groupPublishPayload.payload.groupName, toUserId: member.userId };
                const notificationPayload = NotificationManager_1.default.getInstance().getNotificationPayload(Chats_1.MessageType.GROUP, Groups_1.GroupPublishSubType.MEMBER_ADDED, payload);
                yield RedisClientManager_1.default.getInstance().push(ws_message_1.NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
            }));
        });
    }
    broadcastMessage(messagePayload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.prismaClient.userGroup.update({
                where: {
                    id: messagePayload.memberId
                },
                data: {
                    notificationCount: {
                        increment: 1
                    }
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            email: true
                        }
                    }
                }
            });
            yield this.prismaClient.groupChat.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    userGroupId: messagePayload.memberId,
                    message: messagePayload.message,
                    sentTime: messagePayload.sentTime
                }
            });
            const memberDetails = yield this.prismaClient.group.findMany({
                where: {
                    id: messagePayload.groupId
                },
                select: {
                    members: {
                        where: {
                            NOT: { id: messagePayload.memberId }
                        },
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });
            const groupChatPublishPayload = {
                type: Chats_1.MessageType.GROUP,
                subType: Groups_1.GroupPublishSubType.MESSAGE,
                payload: {
                    groupId: messagePayload.groupId,
                    sender: { memberId: messagePayload.memberId, userId: response.user.id, userName: response.user.userName, email: response.user.email },
                    message: messagePayload.message,
                    sentTime: messagePayload.sentTime,
                }
            };
            const members = memberDetails[0].members.map((details) => {
                return {
                    memberId: details.id,
                    userId: details.user.id
                };
            });
            members === null || members === void 0 ? void 0 : members.forEach((member) => __awaiter(this, void 0, void 0, function* () {
                yield RedisClientManager_1.default.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupChatPublishPayload));
            }));
        });
    }
    seenGroupMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prismaClient.userGroup.update({
                where: {
                    id: payload.memberId
                },
                data: {
                    notificationCount: 0
                }
            });
        });
    }
    getOwnerName(ownerDetails) {
        if (ownerDetails.firstName && ownerDetails.lastName) {
            return `${ownerDetails.firstName} ${ownerDetails.lastName}`;
        }
        if (ownerDetails.firstName) {
            return `${ownerDetails.firstName}`;
        }
        return ownerDetails.email;
    }
}
exports.default = GroupManager;
