"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRIEND_REQUEST = exports.USER_LOGIN_INPUT_SCHEMA = exports.USER_REGISTER_INPUT_SCHEMA = void 0;
const zod_1 = __importDefault(require("zod"));
exports.USER_REGISTER_INPUT_SCHEMA = zod_1.default.object({
    userName: zod_1.default.string().min(5).max(10),
    email: zod_1.default.string(),
    password: zod_1.default.string().min(5).max(15),
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string()
});
exports.USER_LOGIN_INPUT_SCHEMA = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string().min(5).max(15),
});
exports.FRIEND_REQUEST = zod_1.default.object({
    friendRequestId: zod_1.default.string().optional(),
    fromUserId: zod_1.default.string(),
    toUserId: zod_1.default.string(),
    status: zod_1.default.string()
});
