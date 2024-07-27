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
const client_1 = require("@prisma/client");
const auth_1 = require("./../middlewares/auth");
const S3ClientManager_1 = __importDefault(require("../S3ClientManager"));
const userRouter = express_1.default.Router();
const prismaClient = new client_1.PrismaClient();
userRouter.get('/me', auth_1.authValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId || '';
    const response = yield prismaClient.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true
        }
    });
    if (!response) {
        res.status(404).json({
            message: 'User not found'
        });
        return;
    }
    const getMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: `PROFILE_DP:${userId}`,
    };
    const userProfileDpUrl = yield S3ClientManager_1.default.getInstance().getMedia(getMediaParams);
    res.status(200).json({
        userInfo: Object.assign(Object.assign({}, response), { profileImgUrl: userProfileDpUrl })
    });
}));
userRouter.get("/search", auth_1.authValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchedQuery = req.query.ref || "";
    const response = yield prismaClient.user.findMany({
        where: {
            OR: [{ userName: { contains: searchedQuery } }, { firstName: { contains: searchedQuery } }, { lastName: { contains: searchedQuery } }, { email: { contains: searchedQuery } }],
            NOT: [{ id: req.userId }]
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
            friends: {
                where: {
                    friend: {
                        friendId: req.userId
                    }
                }
            }
        }
    });
    const filteredUsers = response.map(data => {
        return Object.assign(Object.assign({}, data), { isFriends: !!data.friends.length });
    });
    res.status(200).json({
        filteredUsers
    });
}));
userRouter.get("/friends", auth_1.authValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId || null;
    if (!userId) {
        res.status(400).json({
            message: 'UserId required'
        });
        return;
    }
    const response = yield prismaClient.user.findMany({
        where: {
            id: userId
        },
        select: {
            friends: {
                select: {
                    friend: {
                        select: {
                            friendId: true
                        }
                    }
                }
            }
        }
    });
    const friends = yield getFriends(response);
    res.status(200).json({
        friends
    });
}));
const getFriends = (response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const friends = yield Promise.all((_b = (_a = response[0]) === null || _a === void 0 ? void 0 : _a.friends) === null || _b === void 0 ? void 0 : _b.map((friend) => __awaiter(void 0, void 0, void 0, function* () {
        const friendDetails = yield prismaClient.user.findFirst({
            where: {
                id: friend.friend.friendId
            },
            select: {
                userName: true,
                email: true
            }
        });
        return { id: friend.friend.friendId, userName: friendDetails === null || friendDetails === void 0 ? void 0 : friendDetails.userName, email: friendDetails === null || friendDetails === void 0 ? void 0 : friendDetails.email };
    })));
    return friends;
});
exports.default = userRouter;
