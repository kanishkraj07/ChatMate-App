import { atom } from "recoil";
import { FriendProfile, SelectedFriend } from "../../models/Friend";

export const SelectedFriendsListAtom = atom<SelectedFriend[]>({
    key: 'FriendsListAtom',
    default: [] as SelectedFriend[]
});


