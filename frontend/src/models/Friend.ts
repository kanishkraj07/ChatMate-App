export interface FriendDetails {
    friendUserId: string;
    friendName: string;
    relationshipId: string;
    friendshipId: string;
    friendDpImgUrl: string;
}

export interface FriendProfile {
    id: string;
    userName: string;
    email: string;
}

export interface SelectedFriend extends FriendProfile {
    checked?: boolean;
}