import { FriendsOnUser, PrismaClient } from '@prisma/client';
import { Member } from '../models/Groups';

class UserManager {
    private static instance: UserManager | null = null;
    private userMap: Map<string, WebSocket>;
    private userGroupDetailsMap: Map<string, Member[]>;
    private prismaClient: PrismaClient;

    async loadUserGroupDetails()  {
       const allgroupsDetails = await this.prismaClient.group.findMany({
            select: {
                id: true,
                members: {
                    select: {
                        id: true,
                        userId: true
                        
                    }
                }
            }
        });

        if(allgroupsDetails) {
            allgroupsDetails.forEach(groupDetails => this.userGroupDetailsMap.set(groupDetails.id, groupDetails.members.map(member => {
               return {memberId: member.id, userId: member.userId} as Member
            }
            )))
        }
    }

    private constructor() {
        this.userMap = new Map<string, WebSocket>();
        this.userGroupDetailsMap = new Map<string, Member[]>();
        this.prismaClient = new PrismaClient();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance
    }

    public addNewUser(ws: WebSocket, userId: string): void {
        this.userMap.set(userId, ws);
    }

    public updateUser(ws: WebSocket, userId: string): void {
        this.userMap.set(userId, ws);
    }

    public deleteUser(userId: string): void {
        delete this.userMap?.[userId];
    }

    public getUserMap(): Map<string, WebSocket> {
        return this.userMap;
    }

    public getWSByUserId(userId: string): WebSocket | undefined {
        return this.userMap.get(userId);
    }

    public getAllFriendshipIdsByUserId(userId: string): string[] {
        return [];
    }

    public getUserGroupMap(): Map<string, Member[]> {
        return this.userGroupDetailsMap;
    }

    public getMembersByGroupId(groupId: string): Member[] {
        return this.userGroupDetailsMap.get(groupId) || [];
    }



    public async validateFriend(relationshipId: string) {
       const response = await this.prismaClient.relationship.findFirst({
            where: {
                id: relationshipId
            },
            select: {
                friends: true,
                status: true
            }
        });
        return response?.friends?.length == 2  && response?.status === 'active';
    }
}

export default UserManager;