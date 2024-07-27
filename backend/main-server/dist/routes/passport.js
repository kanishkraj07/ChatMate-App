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
exports.initPassport = void 0;
const client_1 = require("@prisma/client");
const passport_1 = __importDefault(require("passport"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const GoogleAuthStrategy = require('passport-google-oauth2').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const GOOGLE_PROVIDER = 'GOOGLE';
const GITHUB_PROVIDER = 'GITHUB';
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || 'main-server-url';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'github-client-id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'github-client-secret';
const prismaCLient = new client_1.PrismaClient();
const initPassport = () => {
    passport_1.default.use(new GoogleAuthStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${MAIN_SERVER_URL}/api/v1/auth/provider/google/callback`
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prismaCLient.user.findFirst({
            where: {
                email: profile.emails[0].value
            },
            select: {
                id: true
            }
        });
        if (!user) {
            const userId = (0, uuid_1.v4)();
            yield prismaCLient.user.create({
                data: {
                    id: userId,
                    email: profile.emails[0].value,
                    password: '',
                    providerId: profile.id,
                    provider: GOOGLE_PROVIDER,
                    createdAt: new Date()
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        }
        else {
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        }
    })));
    passport_1.default.use(new GithubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${MAIN_SERVER_URL}/api/v1/auth/provider/github/callback`
    }, (accesToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prismaCLient.user.findFirst({
            where: {
                email: profile.emails[0].value
            },
            select: {
                id: true
            }
        });
        if (!user) {
            const userId = (0, uuid_1.v4)();
            yield prismaCLient.user.create({
                data: {
                    id: userId,
                    email: profile.emails[0].value,
                    userName: profile.username,
                    password: '',
                    providerId: profile.id,
                    provider: GITHUB_PROVIDER,
                    createdAt: new Date()
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        }
        else {
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        }
    })));
};
exports.initPassport = initPassport;
