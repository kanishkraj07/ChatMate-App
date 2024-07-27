import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { GroupGroundAtom, GroupIdsAtom, GroupsList } from "../../store/atoms/GroupAtoms";
import CreateGroupDialog from "./CreateGroupDialog";
import { CurrenActivePanelIdAtom } from "../../store/atoms/ChatAtoms";
import { useEffect, useRef } from "react";
import InputMessageBlock from "../ChatsGround/InputMessageBlock";
import ChatInnerHeader from "../ChatsGround/ChatInnerHeader";
import { GroupMessage, GroupSender } from "../../models/Group";
import WebSocketAtom from "../../store/atoms/WebSocketAtom";
import ChatDetailsBox from "../../ui/ChatDetailsBox";
import { ClientMessage, ClientMessageSubType, ClientMessageType } from "../../models/ClientMessage";
import { MessageBody, RecentMessageDetails } from "../../models/ChatMessages";
import ReceivedMessageBody from "../../ui/Message/ReceivedMessageBody";
import SentMessageBody from "../../ui/Message/SentMessageBody";

const Groups = () => {

    const groupIdsAtom: string[] = useRecoilValue<string[]>(GroupIdsAtom);
    const groupGroundDetails = useRecoilValue(GroupGroundAtom);

    const groupGroundRef = useRef<HTMLDivElement>(null); 


    useEffect(() => {
        groupGroundRef.current?.scrollIntoView();
    }, [groupGroundDetails]);

    return <>
    <div className="w-full h-[78dvh]">
        { groupIdsAtom?.length ? <>
                                        <div className="w-full flex justify-end p-5">
                                            <CreateGroupDialog />
                                        </div>
                                        <div className="relative w-full h-full border border-[rgba(255,255,255,0.1)] rounded-md">
                                            <div className="absolute left-0 top-0 bottom-0 w-[30%] overflow-y-scroll divide-y divide-[rgba(255,255,255,0.2)]">
                                                {groupIdsAtom.map((id: string) => <GroupPanelRenderer panelId={id} /> )}
                                            </div>
                                            {groupGroundDetails.groupId && <div className="h-[78dvh] absolute left-[30.05%] right-0 flex flex-col justify-between items-center border-s border-[rgba(255,255,255,0.5)]">
                                                <ChatInnerHeader friendName={groupGroundDetails.groupName} imgUrl={groupGroundDetails.iconUrl} />
            
                                                <div className="w-full overflow-x-hidden overflow-y-auto overscroll-auto">
                                                    <GroupGroundRenderer />
                                                    <div ref={groupGroundRef}></div>
                                                </div>
                                            <InputMessageBlock varient={ClientMessageType.GROUP} unqId={groupGroundDetails.groupId} />
                                        </div>
                                        }
                                        </div>
                                    </> : <EmptyGroups /> 
        }
    </div>
    </>
}

const GroupPanelRenderer = ({panelId}: {panelId: string}) => {
    const setGroupGroundAtom = useSetRecoilState(GroupGroundAtom);
    const [groupPanelDetails, setGroupPanelDetails] = useRecoilState(GroupsList(panelId));
    const [currentActivePanelId, setCurrentActivePanel] = useRecoilState(CurrenActivePanelIdAtom);
    const recentMessage: GroupMessage = groupPanelDetails.messages?.[groupPanelDetails.messages.length - 1] ?? {} as GroupMessage;
    const webSocketAtom: WebSocket = useRecoilValue(WebSocketAtom);


    const openGroupGround = () => {
        if(currentActivePanelId !== panelId) {
            const clientMessage = {
                type: ClientMessageType.GROUP,
                subType: ClientMessageSubType.SEEN_MESSAGES,
                payload: {groupId: groupPanelDetails.groupId, memberId: groupPanelDetails.members.find((member) => member.userId === localStorage.getItem('USER_ID'))?.memberId}
            } as ClientMessage;
    
            webSocketAtom.send(JSON.stringify(clientMessage));
            setCurrentActivePanel(panelId);
            setGroupGroundAtom({...groupPanelDetails});
        }
    }

    const recentMessageDetails: RecentMessageDetails = {
        message: recentMessage.message,
        lastMessageSender: recentMessage.sentBy,
        senderName: (recentMessage.sender?.userName ?? recentMessage.sender?.email) || '',
        messageDeliveryTime: recentMessage.sentTime
    } as RecentMessageDetails;

    
    return <ChatDetailsBox varient={ClientMessageType.GROUP} name={groupPanelDetails.groupName} imgUrl={groupPanelDetails.iconUrl} recentMessageDetails={recentMessageDetails} onClickFn={() =>  {
        openGroupGround()
    }}/>
}

const GroupGroundRenderer = () => {
    const currentGroupGroundDetails = useRecoilValue(GroupGroundAtom);
    let currentDate: Date; 
    let previousSender: GroupSender | null = null;
    let currentSender: GroupSender | null = null;
   
   return <div className="grid grid-cols-6 py-5 px-7">
            {currentGroupGroundDetails?.messages?.length ?  currentGroupGroundDetails.messages.map((messageDetails: GroupMessage) => {
                    let isRenderDate: boolean = false;
                    let isFollowedMsg: boolean = false;

                    previousSender = currentSender;
                    currentSender = messageDetails.sentBy;
        
                 if (!currentDate) {
                    isRenderDate = true;
                    currentDate = messageDetails.sentTime;
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
                { currentSender === GroupSender.MEMBER ? <RenderFromMessage message={messageDetails.message} isSeen={true} date={new Date()} isFollowedMsg={isFollowedMsg} />
                                                  : <RenderToMessage  message={messageDetails.message} isSeen={true} date={new Date()} isFollowedMsg={isFollowedMsg}  />}
                </>

                }) :  <NoChats />}

            </div>
}

const NoChats = () => {
    return <div className="col-start-2 col-span-4 text-primary-gray justify-self-center">Start a conversation and Enjoy!</div>
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

const EmptyGroups = () => {
    return <div className="w-full h-full text-md text-white font-medium font-sans text-center flex justify-center items-center gap-5">
        Sorry, There are no Groups to display <CreateGroupDialog />
    </div>
}

export default Groups;