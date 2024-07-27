import { atom } from "recoil";

export interface UserDetails {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImgUrl: string;
}

const UserDetailsAtom = atom({
    key: 'UserDetailsAtom',
    default: {} as UserDetails
});

export default UserDetailsAtom;