import { PrismaClient } from "@prisma/client";
import passport from "passport"
import  { v4 as uuidV4 } from 'uuid';
import jsonWebToken from 'jsonwebtoken';
const GoogleAuthStrategy = require('passport-google-oauth2').Strategy;
const GithubStrategy = require('passport-github2').Strategy;

const GOOGLE_PROVIDER = 'GOOGLE';
const GITHUB_PROVIDER = 'GITHUB';
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || 'main-server-url';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'github-client-id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'github-client-secret';

const prismaCLient = new PrismaClient();

export const initPassport = () => {
    passport.use(new GoogleAuthStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${MAIN_SERVER_URL}/api/v1/auth/provider/google/callback`
    }, async(accessToken: string, refreshToken: string, profile: any, done) => {
        const user = await prismaCLient.user.findFirst({
            where: {
               email: profile.emails[0].value
            },
            select: {
                id: true
            }
        });

        if(!user) {
            const userId = uuidV4();
            await prismaCLient.user.create({
                data: {
                    id: userId,
                    email: profile.emails[0].value,
                    password: '',
                    providerId: profile.id,
                    provider: GOOGLE_PROVIDER,
                    createdAt: new Date()
                }
            });

            const token = jsonWebToken.sign({userId}, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        } else {
            const token = jsonWebToken.sign({userId: user.id}, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token)
        }
    }));

    passport.use(new GithubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${MAIN_SERVER_URL}/api/v1/auth/provider/github/callback`
    }, async (accesToken: string, refreshToken: string, profile: any, done: any) => {
        const user = await prismaCLient.user.findFirst({
            where: {
                email: profile.emails[0].value
            },
            select: {
                id: true
            }
        });

        if(!user) {
            const userId = uuidV4();
            await prismaCLient.user.create({
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

            const token = jsonWebToken.sign({userId}, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token);
        } else {
            const token = jsonWebToken.sign({userId: user.id}, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
            done(null, token)
        }
    }));
}