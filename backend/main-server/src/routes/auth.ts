import express from 'express';
import { USER_LOGIN_INPUT_SCHEMA, USER_REGISTER_INPUT_SCHEMA } from '../schemas/user';
import { PrismaClient } from '@prisma/client';
import jsonWebToken, { TokenExpiredError } from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt'
import { initPassport } from './passport';
import passport from 'passport';
import { UserLoginInputs, UserRegisterInputs } from '../models/user';
import multer from 'multer';
import S3CLientManager, { AddMediaParams, GetMediaParams } from '../S3ClientManager';

const authRouter = express.Router();

initPassport();
const prismaClient = new PrismaClient();

const fileUpload = multer({storage: multer.memoryStorage()});

authRouter.post('/signup', fileUpload.single('profileDp'), async (req, res) => {
      const userInputs: UserRegisterInputs = req.body as UserRegisterInputs;
      if(!userInputs) {
        res.status(404).json({
            message: 'No user inputs'
        });
        return;
      }
      
      if(!USER_REGISTER_INPUT_SCHEMA.safeParse(userInputs).success) {
        res.status(400).json({
            messgae: 'Invalid user inputs'
        });
        return;
      }
    
      const user = await prismaClient.user.findFirst({
        where: {
            userName: userInputs.userName
        }
      });

      if(!user) {
        const userId = uuidv4();
        const randomString: string = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userInputs.password, randomString);
        const addMediaParams: AddMediaParams = {
            bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
            unqMediaName: `PROFILE_DP:${userId}`,
            bufferData: req.file?.buffer,
            contentType: req.file?.mimetype
        } as AddMediaParams

        await S3CLientManager.getInstance().addMedia(addMediaParams);
        
        await prismaClient.user.create({
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
            token: genJwtToken({userId}),
            message: 'User signed up successful'
        })
      } else {
        res.status(400).json({
            message: 'User already exists'
        });
      }
    });

authRouter.post('/signin', async (req, res) => {
    const userInputs: UserLoginInputs = (req.body) as UserLoginInputs;

    if(!userInputs) {
        res.status(400).json({
            message: 'No user inputs'
        });
        return;
    }

    if(!USER_LOGIN_INPUT_SCHEMA.safeParse(userInputs).success) {
        res.status(400).json({
            message: 'Invalid user inputs'
        });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: userInputs.email
        },
        select: {
            id: true,
            password: true
        }
    });

    if(!user) {
        res.status(400).json({
            message: 'User not found'
        });
        return;
    }

    const passwordMatched = await bcrypt.compare(userInputs.password, user.password);

    if(!passwordMatched) {
        res.status(400).json({
            message: 'Incorrected password'
        });
        return;
    }

    res.status(200).json({
        message: 'Login successful',
        token: genJwtToken({userId: user.id})
    })
});

authRouter.get('/provider/google', passport.authenticate('google', {scope: ['profile', 'email']}));
authRouter.get('/provider/github', passport.authenticate('github', {scope: ['user:email']}));

authRouter.get('/provider/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: '/failure'
}), (req, res) => {
    res.cookie('token', req?.user);
    res.status(200).redirect('http://localhost:5173/chats')
});

authRouter.get('/provider/github/callback', passport.authenticate('github', {
    session: false,
    failureRedirect: '/failure'
}), (req, res) => {
    res.cookie('token', req?.user);
    res.status(200).redirect('http://localhost:5173/chats')
});

authRouter.get('/failure', (req, res) =>{
    res.status(403).redirect('http://localhost:3000/unauthorized');
})


const genJwtToken: (m: object) => string = (metadata: object) => {
    return jsonWebToken.sign(metadata, process.env.JWT_SECRET_KEY || 'SECRET_KEY')
}

export default authRouter;
