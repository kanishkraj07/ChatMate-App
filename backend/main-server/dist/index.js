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
const routes_1 = __importDefault(require("./routes/routes"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const RedisClient_1 = __importDefault(require("./RedisClient"));
const app = (0, express_1.default)();
dotenv_1.default.config({ path: path_1.default.resolve('../.env') });
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield RedisClient_1.default.getInstance().initRedis();
}))();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1', routes_1.default);
app.use((error, req, res, next) => {
    res.status(500).json({
        message: 'Internal Server Error'
    });
});
app.listen(process.env.MAIN_SERVER_PORT || 3000);
