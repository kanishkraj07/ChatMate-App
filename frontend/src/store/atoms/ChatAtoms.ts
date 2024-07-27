import { atom, atomFamily } from "recoil";
import { Message } from "../../models/ChatMessages";

export interface ChatPanel {
    userId?: string;
    friendName: string;
    friendshipId: string;
    relationshipId: string;
    notificationCount: number;
    friendDpImgUrl: string;
    messages: Message[];
}

export interface ChatGround {
    relationshipId: string;
    friendName: string;
    friendDpImgUrl: string;
    messages: Message[];
}

export const ChatPanelIdsAtom = atom({
    key: 'ChatPanelIdsAtom',
    default: [] as string[]
}) 

export const ChatPanelAtomFamily = atomFamily({
    key: 'ChatAtomFamily',
    default: {} as ChatPanel
});

export const ChatGroundAtom = atom<ChatGround>({
    key: 'ChatGroundAtom',
    default: {} as ChatGround
});

export const CurrenActivePanelIdAtom = atom<string>({
    key: 'CurrenActivePanelIdAtom',
    default: ''
});