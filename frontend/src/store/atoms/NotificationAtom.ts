import { atom, atomFamily } from "recoil";

export interface NotificationDetails {
    type: string;
    subType: string;
    notificationId: string;
    iconUrl?: string;
    message: string;
    sentTime: Date;
    metadata?: any;
}

export const GlobalNotificationCountAtom = atom<number>({
    key: 'GlobalNotificationCountAtom',
    default: 0
});

export const NotificationIdsAtom = atom<string[]>({
    key: 'NotificationIdsAtom',
    default: []
}); 

export const NotificationAtomFamily = atomFamily<NotificationDetails, string>({
    key: 'NotificationAtomFamily',
    default: {} as NotificationDetails
});