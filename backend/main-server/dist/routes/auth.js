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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = require("./passport");
const passport_2 = __importDefault(require("passport"));
const multer_1 = __importDefault(require("multer"));
const S3ClientManager_1 = __importDefault(require("../S3ClientManager"));
const authRouter = express_1.default.Router();
(0, passport_1.initPassport)();
const prismaClient = new client_1.PrismaClient();
const fileUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
authRouter.post('/signup', fileUpload.single('profileDp'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userInputs = req.body;
    if (!userInputs) {
        res.status(404).json({
            message: 'No user inputs'
        });
        return;
    }
    if (!user_1.USER_REGISTER_INPUT_SCHEMA.safeParse(userInputs).success) {
        res.status(400).json({
            messgae: 'Invalid user inputs'
        });
        return;
    }
    const user = yield prismaClient.user.findFirst({
        where: {
            userName: userInputs.userName
        }
    });
    if (!user) {
        const userId = (0, uuid_1.v4)();
        const randomString = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(userInputs.password, randomString);
        const addMediaParams = {
            bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
            unqMediaName: `PROFILE_DP:${userId}`,
            bufferData: (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer,
            contentType: (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype
        };
        yield S3ClientManager_1.default.getInstance().addMedia(addMediaParams);
        yield prismaClient.user.create({
            data: {
                id: userId,
                userName: userInputs.userName,
                email: userInputs.email,
                password: hashedPassword,
                firstName: userInputs.firstName,
                lastName: userInputs.lastName,
                profileImgUrl: `PROFILE_DP:${userId}`,
                createdAt: new Date()
            }
        });
        res.status(200).json({
            token: genJwtToken({ userId }),
            message: 'User signed up successful'
        });
    }
    else {
        res.status(400).json({
            message: 'User already exists'
        });
    }
}));
authRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userInputs = (req.body);
    if (!userInputs) {
        res.status(400).json({
            message: 'No user inputs'
        });
        return;
    }
    if (!user_1.USER_LOGIN_INPUT_SCHEMA.safeParse(userInputs).success) {
        res.status(400).json({
            message: 'Invalid user inputs'
        });
        return;
    }
    const user = yield prismaClient.user.findFirst({
        where: {
            email: userInputs.email
        },
        select: {
            id: true,
            password: true
        }
    });
    if (!user) {
        res.status(400).json({
            message: 'User not found'
        });
        return;
    }
    const passwordMatched = yield bcrypt_1.default.compare(userInputs.password, user.password);
    if (!passwordMatched) {
        res.status(400).json({
            message: 'Incorrected password'
        });
        return;
    }
    res.status(200).json({
        message: 'Login successful',
        token: genJwtToken({ userId: user.id })
    });
}));
authRouter.get('/provider/google', passport_2.default.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/provider/github', passport_2.default.authenticate('github', { scope: ['user:email'] }));
authRouter.get('/provider/google/callback', passport_2.default.authenticate('google', {
    session: false,
    failureRedirect: '/failure'
}), (req, res) => {
    res.cookie('token', req === null || req === void 0 ? void 0 : req.user);
    res.status(200).redirect('http://localhost:5173/chats');
});
authRouter.get('/provider/github/callback', passport_2.default.authenticate('github', {
    session: false,
    failureRedirect: '/failure'
}), (req, res) => {
    res.cookie('token', req === null || req === void 0 ? void 0 : req.user);
    res.status(200).redirect('http://localhost:5173/chats');
});
authRouter.get('/failure', (req, res) => {
    res.status(403).redirect('http://localhost:3000/unauthorized');
});
const genJwtToken = (metadata) => {
    return jsonwebtoken_1.default.sign(metadata, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
};
exports.default = authRouter;
