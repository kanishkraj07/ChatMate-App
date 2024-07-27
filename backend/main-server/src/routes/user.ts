import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authValidator } from './../middlewares/auth';
import { extractName } from '../utils/extractName';
import { FriendDetails } from '../models/user';
import S3CLientManager, { GetMediaParams } from '../S3ClientManager';

const userRouter = express.Router();

const prismaClient = new PrismaClient();

userRouter.get('/me', authValidator, async (req: any, res) => {
    const userId: string = req.userId || '';

    const response = await prismaClient.user.findFirst({
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

    if(!response) {
        res.status(404).json({
            message: 'User not found'
        });
        return;
    }

    const getMediaParams: GetMediaParams = {
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
        unqMediaName: `PROFILE_DP:${userId}`,
    } as GetMediaParams
  
    const userProfileDpUrl: string = await S3CLientManager.getInstance().getMedia(getMediaParams);

    res.status(200).json({
        userInfo: {...response, profileImgUrl: userProfileDpUrl }
    });
})

userRouter.get("/search", authValidator, async(req: any, res) => {
const searchedQuery: any = req.query.ref || "";

   const response = await prismaClient.user.findMany({
        where: {
           OR: [{userName: {contains: searchedQuery}}, {firstName: {contains: searchedQuery}}, {lastName: {contains: searchedQuery}}, {email: {contains: searchedQuery}}],
           NOT: [{id: req.userId}]
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
        return  {
            ...data,
            isFriends: !!data.friends.length
        }
    });

    res.status(200).json({
        filteredUsers
    })
});

userRouter.get("/friends", authValidator, async (req: any, res) => {
    const userId: string = req.userId || null;
    
    if(!userId) {
        res.status(400).json({
            message: 'UserId required'
        });
        return;
    }

       const response = await prismaClient.user.findMany({
            where: {
                id: userId
            },
            select:{
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

        const friends = await getFriends(response);

        res.status(200).json({
            friends
        });
});

const getFriends = async(response: any) => {
            
       const friends = await Promise.all(response[0]?.friends?.map(async(friend: {friend : {friendId: string}}) =>  {
            const friendDetails = await prismaClient.user.findFirst({
                where: {
                    id: friend.friend.friendId
                },
                
                select: {
                    userName: true,
                    email: true
                }
            });

            return {id: friend.friend.friendId, userName: friendDetails?.userName, email: friendDetails?.email} as FriendDetails;
        }))

        return friends;
}

export default userRouter;
