import express from 'express';
import { authValidator } from '../middlewares/auth';
import { AddMemberPayload, Group, Member, NewGroupRequest, UserGroup, UserGroupStatus } from '../models/group';
import { NEW_GROUP_REQUEST } from '../schemas/group';
import { PrismaClient, User } from '@prisma/client';
import {v4 as uuidV4} from 'uuid';
import { GroupSubType, NOTIFICATION_QUEUE, QueuePayload, QueuePayloadType } from '../models/user';
import RedisClient from '../RedisClient';
import { extractName } from '../utils/extractName';
import multer from 'multer';
import S3CLientManager, { AddMediaParams, GetMediaParams } from '../S3ClientManager';

const groupRouter = express.Router();
const prismaClient = new PrismaClient();

const fileUpload = multer({storage: multer.memoryStorage()})

groupRouter.post('/create', authValidator, fileUpload.single('Group_Icon'), async(req: any, res) => {

    if(!NEW_GROUP_REQUEST.safeParse(req.body).success) {
        res.status(400).json({
            message: 'incorrect inputs'
        });
        return;
    }

    const allMembers: string = req.body.members as string;

    const newGroupPayload: NewGroupRequest = {
        ownerId: req.body.ownerId,
        name: req.body.name,
        members: allMembers?.includes(', ') ? allMembers.split(", ") : allMembers ? [allMembers] : []
    } as NewGroupRequest


    const newGroupId = uuidV4();
        const createdAt = new Date();

        const addMediaParams: AddMediaParams = {
            bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
            unqMediaName: `Group_Icon:${newGroupId}`,
            bufferData: req.file?.buffer,
            contentType: req.file?.mimetype
        } as AddMediaParams

        const getMediaParams: GetMediaParams = {
            bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'AWS_IMAGE_BUCKET_NAME',
            unqMediaName: `Group_Icon:${newGroupId}`,
        } as GetMediaParams

        await S3CLientManager.getInstance().addMedia(addMediaParams);
      
        const groupIconUrl: string = await S3CLientManager.getInstance().getMedia(getMediaParams);
    
        const newGroup: Group = {
            id: newGroupId,
            name: newGroupPayload.name,
            ownerId: newGroupPayload.ownerId,
            iconUrl: `Group_Icon:${newGroupId}`,
            createdAt: createdAt,
            memberCount: newGroupPayload?.members?.length,
        } as Group

        let members: Member[] = [];
        
        const userGroupMembers: UserGroup[] = await Promise.all(newGroupPayload.members.map(async (userId: string) => {
            const id: string = uuidV4();
          const response = await prismaClient.user.findFirst({
                where: {
                    id: userId
                },
                
                select: {
                    userName: true,
                    email: true
                }
            })
            members.push({memberId: id, userId, userName: response?.userName, email: response?.email} as Member);
            return{
                id,
                userId,
                groupId: newGroupId,
                isOwner: userId === newGroupPayload.ownerId,
                joinedDate: createdAt,
                notificationCount: 1,
                status: UserGroupStatus.JOINED
            } as UserGroup
          }));

        const response =  await prismaClient.group.create({
                data: {
                   ...newGroup,
                   members: {
                    createMany: {
                        data: []
                    }
                   }
                },
                select: {
                    user: {
                        select: {
                            userName: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            await prismaClient.userGroup.createMany({
                data: [...userGroupMembers]
            })

            const payload = {groupName: newGroup.name, toUserId: newGroup.ownerId, iconUrl: groupIconUrl};

            const notificationPayload = getNotificationPayload(QueuePayloadType.GROUP, GroupSubType.CREATED, payload)

            RedisClient.getInstance().pushEvent(NOTIFICATION_QUEUE, JSON.stringify(notificationPayload))

            const addMembersPayload: AddMemberPayload = {
                groupId: newGroupId,
                groupName: newGroup.name,
                ownerId: newGroup.ownerId,
                ownerName: extractName(response?.user as User),
                members: members,
                iconUrl: groupIconUrl,
                addedAt: createdAt
            } as AddMemberPayload;
        
          await addMembers(addMembersPayload);

          res.status(200).json({
            groupDetails: addMembersPayload
          });
});

const addMembers = async (data: AddMemberPayload) => {

    const groupPublishPayload: QueuePayload = {
     type: QueuePayloadType.GROUP,
     subType: GroupSubType.MEMBER_ADDED,
     payload: data
    } as QueuePayload

    await Promise.all(data.members.map(async(member: Member) => {
        await  RedisClient.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupPublishPayload));
        const payload = {toUserId: member.userId, groupName: data.groupName, iconUrl: data.iconUrl};
        const notificationPayload = getNotificationPayload(QueuePayloadType.GROUP, GroupSubType.MEMBER_ADDED, payload);
        await  RedisClient.getInstance().pushEvent(NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
     })); 
 }

const getNotificationPayload = (type: string, subType: string, payload: any): QueuePayload => {
    return {
        type,
        subType,
        payload
       } as QueuePayload
}


export default groupRouter;