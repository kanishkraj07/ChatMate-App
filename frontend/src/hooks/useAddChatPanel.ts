import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import { ChatGroundAtom, ChatPanel, ChatPanelAtomFamily, ChatPanelIdsAtom, CurrenActivePanelIdAtom, ChatGround } from "../store/atoms/ChatAtoms";
import { FriendshipDetails, Message, Sender } from "../models/ChatMessages";
import { ClientMessage, ClientMessageSubType, ClientMessageType } from "../models/ClientMessage";
import WebSocketAtom from "../store/atoms/WebSocketAtom";

export const useAddChatPanel = () => {

    const setChatPanelIdsAtom = useSetRecoilState(ChatPanelIdsAtom);

    return useRecoilCallback(({set}) => 
      (chatPanelDetails: ChatPanel) => {
        setChatPanelIdsAtom((ids) => [chatPanelDetails.relationshipId, ...ids]);
        set(ChatPanelAtomFamily(chatPanelDetails.relationshipId), chatPanelDetails)
      }
    );
}

export const useAddMessageToPanel = () => {
  const setChatGroundAtom = useSetRecoilState(ChatGroundAtom);
  const webSocketAtom: WebSocket = useRecoilValue(WebSocketAtom);

  return useRecoilCallback(({set, snapshot}) => async (id: string, newMessage: Message) =>{
    const currentActivePanelId = await snapshot.getPromise(CurrenActivePanelIdAtom);
   const details = await snapshot.getPromise(ChatPanelAtomFamily(id));

   if(currentActivePanelId === id) {
    if(newMessage.sentBy === Sender.ME) {
      const clientMessage = {
        type: ClientMessageType.CHAT,
        subType: ClientMessageSubType.SEEN_MESSAGES,
        payload: {friendshipId: details.friendshipId, relationshipId: details.relationshipId, fromUserId: localStorage.getItem('USER_ID'), toUserId: details.userId} as FriendshipDetails
    } as ClientMessage;
  
    webSocketAtom.send(JSON.stringify(clientMessage));
    }

    setChatGroundAtom((details) => {
      return {friendName: details?.friendName, relationshipId: details?.relationshipId, friendDpImgUrl: details.friendDpImgUrl, messages: [...details?.messages, newMessage]} as ChatGround
    });

  }
    set(ChatPanelAtomFamily(id), {userId: details.userId, relationshipId: id, friendName: details.friendName, friendDpImgUrl: details.friendDpImgUrl, friendshipId: details.friendshipId, notificationCount: currentActivePanelId === id ? 0 : details.notificationCount + 1, messages: [...details?.messages, newMessage]} as ChatPanel);
  });
}