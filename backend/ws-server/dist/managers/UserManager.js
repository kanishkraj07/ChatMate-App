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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class UserManager {
    loadUserGroupDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const allgroupsDetails = yield this.prismaClient.group.findMany({
                select: {
                    id: true,
                    members: {
                        select: {
                            id: true,
                            userId: true
                        }
                    }
                }
            });
            if (allgroupsDetails) {
                allgroupsDetails.forEach(groupDetails => this.userGroupDetailsMap.set(groupDetails.id, groupDetails.members.map(member => {
                    return { memberId: member.id, userId: member.userId };
                })));
            }
        });
    }
    constructor() {
        this.userMap = new Map();
        this.userGroupDetailsMap = new Map();
        this.prismaClient = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }
    addNewUser(ws, userId) {
        this.userMap.set(userId, ws);
    }
    updateUser(ws, userId) {
        this.userMap.set(userId, ws);
    }
    deleteUser(userId) {
        var _a;
        (_a = this.userMap) === null || _a === void 0 ? true : delete _a[userId];
    }
    getUserMap() {
        return this.userMap;
    }
    getWSByUserId(userId) {
        return this.userMap.get(userId);
    }
    getAllFriendshipIdsByUserId(userId) {
        return [];
    }
    getUserGroupMap() {
        return this.userGroupDetailsMap;
    }
    getMembersByGroupId(groupId) {
        return this.userGroupDetailsMap.get(groupId) || [];
    }
    validateFriend(relationshipId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const response = yield this.prismaClient.relationship.findFirst({
                where: {
                    id: relationshipId
                },
                select: {
                    friends: true,
                    status: true
                }
            });
            return ((_a = response === null || response === void 0 ? void 0 : response.friends) === null || _a === void 0 ? void 0 : _a.length) == 2 && (response === null || response === void 0 ? void 0 : response.status) === 'active';
        });
    }
}
UserManager.instance = null;
exports.default = UserManager;
