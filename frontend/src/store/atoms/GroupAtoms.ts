import { atom, atomFamily } from "recoil";
import { GroupDetails } from "../../models/Group";

export const GroupsList = atomFamily<GroupDetails, string>({
    key: 'GroupsList',
    default: {} as GroupDetails
});

export const GroupIdsAtom = atom<string[]>({
    key: 'GroupIdsAtom',
    default: [] as string[]
});

export const GroupGroundAtom = atom<GroupDetails>({
    key: 'GroupGroundAtom',
    default: {} as GroupDetails
});