"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authValidator = (req, res, next) => {
    var _a;
    const auth_header = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    if (!auth_header) {
        res.status(400).json({
            message: "no authorization header"
        });
    }
    const bearerToken = auth_header;
    const token = bearerToken.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
        req.userId = payload === null || payload === void 0 ? void 0 : payload.userId;
        next();
    }
    catch (e) {
        res.status(403).json({
            message: 'Unauthorized user'
        });
    }
};
exports.authValidator = authValidator;
