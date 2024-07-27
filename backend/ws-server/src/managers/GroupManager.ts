import { PrismaClient, User } from "@prisma/client";
import { GroupMessage, GroupPublishSubType, NewGroupPayload, AddMemberPayload, UserGroup, UserGroupStatus, SeenGroupMessage } from "../models/Groups";
import { Group, Member } from './../models/Groups';
import {v4 as uuidV4} from 'uuid'
import RedisClientManager from "./RedisClientManager";
import UserManager from "./UserManager";
import { MessageType } from "../models/Chats";
import NotificationManager from "./NotificationManager";
import { NOTIFICATION_QUEUE, PublishPayload } from "../models/ws_message";

class GroupManager {

    private static instance: GroupManager;
    private prismaClient: PrismaClient;

    private constructor() {
        this.prismaClient = new PrismaClient();
    }

    static getInstance(): GroupManager {
        if(!this.instance) {
            this.instance = new GroupManager();
        }
        return this.instance;
    }

     async createGroup(newGroupPayload: NewGroupPayload) {
        const newGroupId = uuidV4();
        const createdAt = new Date();
    
        const newGroup: Group = {
            id: newGroupId,
            name: newGroupPayload.name,
            ownerId: newGroupPayload.ownerId,
            createdAt: createdAt,
            memberCount: newGroupPayload.members.length,
        } as Group

        let members: Member[] = [];
        
        const userGroupMembers: UserGroup[] = newGroupPayload.members.map((userId: string) => {
            const id: string = uuidV4();
            members.push({memberId: id, userId} as Member);
            return{
                id,
                userId: userId,
                groupId: newGroupId,
                isOwner: userId === newGroupPayload.ownerId,
                joinedDate: createdAt,
                status: UserGroupStatus.JOINED
            } as UserGroup
          });

        const response =  await this.prismaClient.group.create({
                data: {
                   ...newGroup,
                    members: {
                        createMany: {
                            data: userGroupMembers
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

            const payload = {groupName: newGroup.name, toUserId: newGroup.ownerId};

            const notificationPayload = NotificationManager.getInstance().getNotificationPayload(MessageType.GROUP, GroupPublishSubType.CREATED, payload)

            RedisClientManager.getInstance().push(NOTIFICATION_QUEUE, JSON.stringify(notificationPayload))

            const addMembersPayload: AddMemberPayload = {
                groupId: newGroupId,
                groupName: newGroup.name,
                ownerId: newGroup.ownerId,
                ownerName: this.getOwnerName(response.user as User),
                members: members,
                addedAt: createdAt
            } as AddMemberPayload;
        this.addMembers(addMembersPayload);
    }

    async addMembers(data: AddMemberPayload) {
       const userGroupMap = UserManager.getInstance().getUserGroupMap();
       const currentMembers = userGroupMap.get(data.groupId);
       if(currentMembers?.length) {
        userGroupMap.set(data.groupId, [...currentMembers, ...data.members]);
       } else {
        userGroupMap.set(data.groupId, [...data.members])
       }

       const groupPublishPayload: PublishPayload = {
        type: 'group',
        subType: GroupPublishSubType.MEMBER_ADDED,
        payload: data
       } as PublishPayload

        data.members.forEach(async(member: Member) => {
           await  RedisClientManager.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupPublishPayload));
           const payload = {groupName: groupPublishPayload.payload.groupName, toUserId: member.userId};
           const notificationPayload = NotificationManager.getInstance().getNotificationPayload(MessageType.GROUP, GroupPublishSubType.MEMBER_ADDED, payload);
           await  RedisClientManager.getInstance().push(NOTIFICATION_QUEUE, JSON.stringify(notificationPayload));
        }); 
    }

    async broadcastMessage(messagePayload: GroupMessage) {

      const response = await this.prismaClient.userGroup.update({
            where: {
                id: messagePayload.memberId
            },
            data: {
                notificationCount: {
                    increment: 1
                }
            },
            select: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true
                    }
                }
            }
        });
        
        await this.prismaClient.groupChat.create({
            data: {
                id: uuidV4(),
                userGroupId: messagePayload.memberId,
                message: messagePayload.message,
                sentTime: messagePayload.sentTime
            }
        });


       const memberDetails = await this.prismaClient.group.findMany({
            where: {
                id: messagePayload.groupId
            },

            select: {
                members: {
                    where:{
                        NOT: {id: messagePayload.memberId}
                    },

                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });
        
        const groupChatPublishPayload: PublishPayload = {
            type: MessageType.GROUP,
            subType: GroupPublishSubType.MESSAGE,
            payload: {
                groupId: messagePayload.groupId,
                sender: {memberId: messagePayload.memberId, userId: response.user.id, userName: response.user.userName, email: response.user.email },
                message: messagePayload.message,
                sentTime: messagePayload.sentTime,
            }
        } as PublishPayload

        const members: Member[] = memberDetails[0].members.map((details) => {
            return {
                memberId: details.id,
                userId: details.user.id
            } as Member
        })

     members?.forEach(async (member: Member) => {
       await RedisClientManager.getInstance().publish(`group:${member.userId}`, JSON.stringify(groupChatPublishPayload))
    });
    }

    public async seenGroupMessage(payload: SeenGroupMessage) {
        await this.prismaClient.userGroup.update({
            where: {
                id: payload.memberId
            },
            data: {
                notificationCount: 0
            }
        });
    }

    getOwnerName(ownerDetails: User): string {
        if(ownerDetails.firstName && ownerDetails.lastName) {
            return `${ownerDetails.firstName} ${ownerDetails.lastName}`
        }
        if(ownerDetails.firstName) {
            return `${ownerDetails.firstName}`
        }
        return ownerDetails.email;
    }
}

export default GroupManager;