import ChatDetailsBox from "../../ui/ChatDetailsBox";
import ChatInnerHeader from "./ChatInnerHeader";
import InputMessageBlock from "./InputMessageBlock";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import SentMessageBody from "../../ui/Message/SentMessageBody";
import { FriendshipDetails, Message, MessageBody, RecentMessageDetails, Sender } from "../../models/ChatMessages";
import ReceivedMessageBody from './../../ui/Message/ReceivedMessageBody';
import { useEffect, useRef } from "react";
import { ChatGround, ChatGroundAtom, ChatPanel, ChatPanelAtomFamily, ChatPanelIdsAtom, CurrenActivePanelIdAtom } from "../../store/atoms/ChatAtoms";
import WebSocketAtom from "../../store/atoms/WebSocketAtom";
import { ClientMessage, ClientMessageSubType, ClientMessageType } from "../../models/ClientMessage";

export const Chats = () => {

    const chatPanelIds: string[] = useRecoilValue<string[]>(ChatPanelIdsAtom);
    const chatGroundDetails = useRecoilValue(ChatGroundAtom);

    const chatGroundRef = useRef<HTMLDivElement>(null); 


    useEffect(() => {
        chatGroundRef.current?.scrollIntoView();
    }, [chatGroundDetails]);

    return chatPanelIds?.length && <div className="relative w-full h-[78dvh] border border-[rgba(255,255,255,0.1)] rounded-md">
      <div className="absolute left-0 top-0 bottom-0 w-[30%] overflow-y-scroll divide-y divide-[rgba(255,255,255,0.2)]">
                {chatPanelIds.map((id: string) => <ChatPanelRenderer chatPanelId={id} /> )}
        </div>
         {chatGroundDetails.relationshipId && <div className="h-[78dvh] absolute left-[30.05%] right-0 flex flex-col justify-between items-center border-s border-[rgba(255,255,255,0.5)]">
        <ChatInnerHeader friendName={chatGroundDetails.friendName} imgUrl={chatGroundDetails.friendDpImgUrl} />
    
            <div className="w-full overflow-x-hidden overflow-y-auto overscroll-auto">
                <ChatGroundRenderer />
                <div ref={chatGroundRef}></div>
            </div>
            <InputMessageBlock varient={ClientMessageType.CHAT} unqId={chatGroundDetails.relationshipId} />
        </div>
         }
</div>
}


const ChatPanelRenderer = ({chatPanelId}: {chatPanelId: string}) => {
    const setChatGroundAtom = useSetRecoilState(ChatGroundAtom);
    const [chatPanelDetails, setChatPanelDetails] = useRecoilState(ChatPanelAtomFamily(chatPanelId));
    const [currentActivePanelId, setCurrentActivePanel] = useRecoilState(CurrenActivePanelIdAtom);
    const recentMessage: Message = chatPanelDetails.messages?.[chatPanelDetails.messages.length - 1] ?? {} as Message;
    const webSocketAtom: WebSocket = useRecoilValue(WebSocketAtom);


    const openChatGround = () => {
        if(currentActivePanelId !== chatPanelId) {
            const clientMessage = {
                type: ClientMessageType.CHAT,
                subType: ClientMessageSubType.SEEN_MESSAGES,
                payload: {friendshipId: chatPanelDetails.friendshipId, relationshipId: chatPanelDetails.relationshipId, fromUserId: localStorage.getItem('USER_ID'), toUserId: chatPanelDetails.userId} as FriendshipDetails
            } as ClientMessage;
    
            webSocketAtom.send(JSON.stringify(clientMessage));
            setCurrentActivePanel(chatPanelDetails.relationshipId);
            setChatGroundAtom({ relationshipId: chatPanelDetails.relationshipId, friendName: chatPanelDetails.friendName, friendDpImgUrl: chatPanelDetails.friendDpImgUrl, messages: chatPanelDetails.messages } as ChatGround);
            setChatPanelDetails({userId: chatPanelDetails.userId, relationshipId: chatPanelDetails.relationshipId, friendName: chatPanelDetails.friendName, friendDpImgUrl: chatPanelDetails.friendDpImgUrl, friendshipId: chatPanelDetails.friendshipId, notificationCount: 0, messages: chatPanelDetails.messages} as ChatPanel)
        }
    }

    const recentMessageDetails: RecentMessageDetails = {
        message: recentMessage.message,
        isMessageSeen: recentMessage.isSeen,
        lastMessageSender: recentMessage.sentBy,
        messageDeliveryTime: recentMessage.sentTime
    } as RecentMessageDetails;

    
    return <ChatDetailsBox varient={ClientMessageType.CHAT} name={chatPanelDetails.friendName} imgUrl={chatPanelDetails.friendDpImgUrl} recentMessageDetails={recentMessageDetails} newMessagesCount={chatPanelDetails.notificationCount} onClickFn={() =>  {
        openChatGround()
    }}/>
}


const ChatGroundRenderer = () => {
    const currentChatGroundDetails = useRecoilValue(ChatGroundAtom);
    let currentDate: Date; 
    let previousSender: Sender | null = null;
    let currentSender: Sender | null = null;
   
   return <div className="grid grid-cols-6 py-5 px-7">
            {currentChatGroundDetails?.messages?.length ?  currentChatGroundDetails.messages.map((messageDetails: Message) => {
                    let isRenderDate: boolean = false;
                    let isFollowedMsg: boolean = false;

                    previousSender = currentSender;
                    currentSender = messageDetails.sentBy;
        
                 if (!currentDate) {
                    isRenderDate = true;
                    currentDate = messageDetails.sentTime;
                    console.log('in', currentDate)
                 }

                 if(new Date(currentDate).toLocaleDateString('en-GB') !== new Date(messageDetails.sentTime).toLocaleDateString('en-GB')) {
                    isRenderDate = true;
                    currentDate = messageDetails.sentTime;
                 }

                 if(currentSender === previousSender) {
                    isFollowedMsg = true;
                 }

               return  <>
               
                { isRenderDate && <RenderDate date={currentDate}/>}
                {!isFollowedMsg && <EmptyRow  />}
                { currentSender === Sender.FRIEND ? <RenderFromMessage message={messageDetails.message} isSeen={true} date={new Date()} isFollowedMsg={isFollowedMsg} />
                                                  : <RenderToMessage  message={messageDetails.message} isSeen={true} date={new Date()} isFollowedMsg={isFollowedMsg}  />}
                </>

                }) :  <NoChats />}

            </div>
}

const NoChats = () => {
    return <div className="col-start-2 col-span-4 text-primary-gray justify-self-center">You can Start your communication and Enjoy!</div>
}

const RenderDate = ({date}: {date: Date}) => {
    return <>
            <div className="col-start-2 col-span-4 text-primary-gray text-sm justify-self-center">
                {new Date(date).toLocaleDateString('en-GB')}
            </div>
             <EmptyRow isNewDay={true} />
        </> 
}

const RenderFromMessage = ({message, isSeen, date, isFollowedMsg}: MessageBody ) => {
    return <div className="col-span-6 justify-self-start my-1">
        <ReceivedMessageBody message={message} isSeen={isSeen} date={date} isFollowedMsg={isFollowedMsg} />
    </div>
}

const RenderToMessage = ({message, isSeen, date, isFollowedMsg}: MessageBody) => {
    return <div className="col-start-4 col-span-3 justify-self-end my-1">
        <SentMessageBody message={message} isSeen={isSeen} date={date} isFollowedMsg={isFollowedMsg} />
    </div>
}

const EmptyRow = ({isNewDay}: {isNewDay?: boolean}) => {
    return <div className={"col-span-6 " + (isNewDay ? "h-9" : "h-5")}>
        </div>
}

export default Chats;