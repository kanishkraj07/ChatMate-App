"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEW_GROUP_REQUEST = void 0;
const zod_1 = __importDefault(require("zod"));
exports.NEW_GROUP_REQUEST = zod_1.default.object({
    ownerId: zod_1.default.string(),
    name: zod_1.default.string(),
    members: zod_1.default.string().optional()
});
