import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons/faMicrophone";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import  TextAreaBox  from '../../ui/TextAreaBox';
import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ChatMessagePayload, Message, Sender } from "../../models/ChatMessages";
import { ChatPanelAtomFamily } from "../../store/atoms/ChatAtoms";
import WebSocketAtom from "../../store/atoms/WebSocketAtom";
import { ClientMessage, ClientMessageSubType, ClientMessageType } from "../../models/ClientMessage";
import { useAddMessageToPanel } from "../../hooks/useAddChatPanel";
import { GroupMessage, GroupMessagePayload, GroupSender, Member } from "../../models/Group";
import { GroupGroundAtom } from "../../store/atoms/GroupAtoms";
import { useAddMessageInGroup } from "../../hooks/useAddGroup";

const InputMessageBlock = ({varient, unqId}: {varient: ClientMessageType, unqId: string}) => {
    const [typedMsg, setTypedMsg] = useState<string>('');
    const [currentChatPanel, setCurrentChatPanel] = useRecoilState(ChatPanelAtomFamily(unqId));
    const [doClear, setDoClear] = useState<boolean>(false);
    const webSocketAtom = useRecoilValue(WebSocketAtom);
    const addMessage = useAddMessageToPanel();

    const [groupGround, setGroupGround] = useRecoilState(GroupGroundAtom);
    const addMessageInGroup = useAddMessageInGroup();

    const sendMessage = () => {

        if(varient === ClientMessageType.CHAT) {
            const newMessage: Message = {message: typedMsg, sentBy: Sender.ME, sentTime: new Date()} as Message;
            const chatMessPayload: ChatMessagePayload = {
                friendshipId: currentChatPanel.friendshipId,
                relationshipId: unqId,
                fromUserId: localStorage.getItem('USER_ID'),
                toUserId: currentChatPanel.userId,
                message: newMessage.message,
                sentTime: newMessage.sentTime
            } as ChatMessagePayload
    
    
            const clientMessage = {
                type: ClientMessageType.CHAT,
                subType: ClientMessageSubType.MESSAGE,
                payload: chatMessPayload
            } as ClientMessage
    
            webSocketAtom.send(JSON.stringify(clientMessage));
            addMessage(unqId, newMessage);
        } else {

            const meAsMember: Member = groupGround.members.find(member => member.userId === localStorage.getItem('USER_ID')) || {} as Member; 
            console.log(meAsMember);
            const newMessage: GroupMessage = {message: typedMsg, sender: meAsMember, sentBy: GroupSender.ME, sentTime: new Date()} as GroupMessage;

            const GroupMessPayload: GroupMessagePayload = {
                groupId: groupGround.groupId,
                memberId: meAsMember.memberId,
                message: newMessage.message,
                sentTime: newMessage.sentTime,
            } as GroupMessagePayload
    
    
            const clientMessage = {
                type: ClientMessageType.GROUP,
                subType: ClientMessageSubType.MESSAGE,
                payload: GroupMessPayload
            } as ClientMessage

            webSocketAtom.send(JSON.stringify(clientMessage));
            addMessageInGroup(groupGround.groupId, newMessage);
        }
       
        setTypedMsg('');
        setDoClear((doClear) => !doClear);
    }

    return <div className="w-full bg-primary-tint-1 flex justify-between items-center gap-5 px-5 py-3 text-primary-slate">
        <button className="py-2 px-1"><FontAwesomeIcon icon={faFaceSmile} size="xl"/></button>
        <button className="py-2 px-1"><FontAwesomeIcon icon={faPlus} size="xl" /></button>
        <TextAreaBox placeholder="Type a message" setValue={(value) => setTypedMsg(value)} doClear={doClear}/>
        {!typedMsg.length && <button className="py-2 px-1"><FontAwesomeIcon icon={faMicrophone} size="xl" /></button>}
        {typedMsg.length > 0 && <button className="py-2 px-1" onClick={sendMessage}><SendHorizonal /></button>}
</div>
}

export default InputMessageBlock;