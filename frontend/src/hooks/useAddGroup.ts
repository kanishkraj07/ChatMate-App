import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil"
import { GroupGroundAtom, GroupIdsAtom, GroupsList } from "../store/atoms/GroupAtoms";
import { Group, GroupDetails, GroupMessage, GroupSender } from "../models/Group";
import { CurrenActivePanelIdAtom } from "../store/atoms/ChatAtoms";
import { ClientMessage, ClientMessageSubType, ClientMessageType } from "../models/ClientMessage";
import WebSocketAtom from "../store/atoms/WebSocketAtom";

export const useAddGroup = () => {
    const setGroupIdsAtom = useSetRecoilState(GroupIdsAtom);
    return useRecoilCallback(({set}) => (newGroup: Group) => {
        setGroupIdsAtom((ids: string[]) => [newGroup.groupId,...ids])
        set(GroupsList(newGroup.groupId), newGroup as GroupDetails);
    })
}

export const useAddMessageInGroup = () => {
    const setGroupGround = useSetRecoilState(GroupGroundAtom);
    const webSocketAtom = useRecoilValue(WebSocketAtom);

    return useRecoilCallback(({set, snapshot}) => async(groupId: string, newMessage: GroupMessage) => {
        const currentActivePanelId = await snapshot.getPromise(CurrenActivePanelIdAtom);
        const groupPanelDetails = await snapshot.getPromise(GroupsList(groupId));
        if(currentActivePanelId === groupId) {
            setGroupGround((details) => {
                return {
                    groupId: details.groupId,
                    groupName: details.groupName,
                    ownerId: details.ownerId,
                    ownerName: details.ownerName,
                    addedAt: details.addedAt,
                    members: details.members,
                    messages: details?.messages ? [...details.messages, newMessage] : [newMessage]
                } as GroupDetails
            } );

            if(newMessage.sentBy === GroupSender.MEMBER) {
                const clientMessage = {
                  type: ClientMessageType.GROUP,
                  subType: ClientMessageSubType.SEEN_MESSAGES,
                  payload:  { memberId: newMessage.sender.memberId, groupId }
              } as ClientMessage;
            
              webSocketAtom.send(JSON.stringify(clientMessage));
              }
        }

        set(GroupsList(groupId), {
            groupId: groupPanelDetails.groupId,
            groupName: groupPanelDetails.groupName,
            ownerId: groupPanelDetails.ownerId,
            ownerName: groupPanelDetails.ownerName,
            addedAt: groupPanelDetails.addedAt,
            members: groupPanelDetails.members,
            messages: groupPanelDetails?.messages ? [...groupPanelDetails.messages, newMessage] : [newMessage]
        } as GroupDetails)
    })
}