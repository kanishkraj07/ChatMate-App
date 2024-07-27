import './Home.css';
import Header from "./Header";
import { NAV_ITEMS, NavItem } from '../../models/NavItems';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import { MessageData } from '../../models/MessageData';
import { GlobalNotificationCountAtom, NotificationDetails } from '../../store/atoms/NotificationAtom';
import WebSocketAtom from '../../store/atoms/WebSocketAtom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import UserDetailsAtom, { UserDetails } from './../../store/atoms/UserDetailsAtom';
import useAddNotification from '../../hooks/useAddNotification';
import { FriendRequestType } from '../../ui/NotificationMenuItem';
import { FriendDetails } from '../../models/Friend';
import { useAddChatPanel, useAddMessageToPanel } from '../../hooks/useAddChatPanel';
import { ClientMessageSubType, ClientMessageType } from '../../models/ClientMessage';
import { ChatPanel } from './../../store/atoms/ChatAtoms';
import { Message, Sender } from '../../models/ChatMessages';
import { useAddGroup, useAddMessageInGroup } from '../../hooks/useAddGroup';
import { Group, GroupMessage, GroupSender } from '../../models/Group';
import axios, { AxiosResponse } from 'axios';

export const Home = () => {

    const setUserDetailsAtom = useSetRecoilState(UserDetailsAtom);
    const setWebSocketAtom = useSetRecoilState(WebSocketAtom);
    const setNotificationCount = useSetRecoilState(GlobalNotificationCountAtom);
    const addNotification = useAddNotification();
    const addFriendChatPanel = useAddChatPanel();
    const addMessageToPanel = useAddMessageToPanel();
    const addMessageInGroup = useAddMessageInGroup();
    const addGroup = useAddGroup();
    const [isUserLoggedIn, setIsUserLoggedIn]  = useState<boolean>(false);

    const token: string = localStorage.getItem('token') || '';

    useEffect(() => {
        (async () => {
            try {
             const response: AxiosResponse<{userInfo: UserDetails}> = await axios.get<{userInfo: UserDetails}>("http://localhost:3000/api/v1/user/me", {headers: {Authorization: `Bearer ${token}`}});
             const userInfo = response.data.userInfo;
             setUserDetailsAtom({
                id: userInfo.id,
                userName: userInfo.userName,
                email: userInfo.email,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                profileImgUrl: userInfo.profileImgUrl
             }as UserDetails)
             setIsUserLoggedIn(true);
    
            } catch(e) {

            }
            }
        )();
    }, [])

    useEffect(() => {
        if(isUserLoggedIn) {
            const userId: string = jwtDecode<JwtPayload | any>(token)?.userId;
            localStorage.setItem('USER_ID', userId);
            const ws: WebSocket = new WebSocket(`http://localhost:8000?userId=${userId}`);
            ws.onopen = () => {
                setWebSocketAtom(ws);
            }
    
            ws.onclose = () => {
                ws.close();
            }
    
            ws.onmessage = async (message: MessageEvent) => {
                const messageData: MessageData = JSON.parse(message.data);
    
               if(messageData.type === 'notification') {
                    if(messageData.subType === 'group') {
                        const newNotificationDetails = {
                            type: messageData.subType,
                            subType: messageData.payload.ref,
                            notificationId: messageData.payload.notificationId,
                            message: messageData.payload.message,
                            sentTime: messageData.payload.sentTime,
                            iconUrl: messageData.payload.iconUrl,
                            metadata: messageData?.metadata ? JSON.parse(messageData.metadata) : {}
                        } as NotificationDetails;
                        addNotification(newNotificationDetails);
                        setNotificationCount((notificationCount: number) => ++notificationCount);             
                    }
                    if(messageData.subType === 'friendRequest') {
                      
                        const newNotificationDetails = {
                            type: messageData.subType,
                            subType: messageData.payload.ref,
                            notificationId: messageData.payload.notificationId,
                            message: messageData.payload.message,
                            sentTime: messageData.payload.sentTime,
                            iconUrl: messageData.payload.imageUrl,
                            metadata: messageData?.metadata ? JSON.parse(messageData.metadata) : {}
                        } as NotificationDetails;
    
                        addNotification(newNotificationDetails);
                        setNotificationCount((notificationCount: number) => ++notificationCount);                    
                    }
               }
    
               if(messageData.type === ClientMessageType.CHAT) {
                if(messageData.subType === ClientMessageSubType.MESSAGE) {
                    const relationshipId: string = messageData.payload.relationshipId;
                    const newMessage: Message = {message: messageData.payload.message, sentBy: Sender.FRIEND, sentTime: messageData.payload.sentTime} as Message;
                    await addMessageToPanel(relationshipId, newMessage);
                }
               }
    
               if(messageData.type === ClientMessageType.GROUP) {
                if(messageData.subType === ClientMessageSubType.MESSAGE) {
                    const groupId: string = messageData.payload.groupId;
                   const newMessage: GroupMessage = {message: messageData.payload.message, sentBy: GroupSender.MEMBER, sender: messageData.payload.sender, sentTime: messageData.payload.sentTime} as GroupMessage;
                   await addMessageInGroup(groupId, newMessage);
                }

                if(messageData.subType === ClientMessageSubType.MEMBER_ADDED) {
                    addGroup(messageData.payload as Group);
                }
               }
    
               if(messageData.type === 'friendRequest') {
                if(messageData.subType === FriendRequestType.ACCEPTED) {
                    const friendDetails: FriendDetails = messageData.payload as FriendDetails;
                    addFriendChatPanel({userId: friendDetails.friendUserId, friendName: friendDetails.friendName, friendshipId: friendDetails.friendshipId, relationshipId: friendDetails.relationshipId, friendDpImgUrl: friendDetails.friendDpImgUrl, notificationCount: 1, messages: []} as ChatPanel);
                }
               }
            
            }
        }
    }, [isUserLoggedIn]);

    return isUserLoggedIn && <div>
        <Header />
        <Outlet />
    </div>  
}