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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const notificationRouter = express_1.default.Router();
const prismaClient = new client_1.PrismaClient();
notificationRouter.delete("/", auth_1.authValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationId = req.query.notificationId;
    yield prismaClient.notificationDetails.delete({
        where: {
            id: notificationId
        }
    });
    res.status(200).json({
        messsage: "Notification delete successful"
    });
}));
exports.default = notificationRouter;
