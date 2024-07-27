import axios from "axios";
import { Button } from "./Button";
import ProfilePhoto from "./ProfilePhoto"
import { useState } from "react";
import FriendRequests from "../components/FriendRequestsGround/FriendRequests";
import { useAddChatPanel } from "../hooks/useAddChatPanel";
import { ChatPanel } from "../store/atoms/ChatAtoms";
import { FriendDetails } from "../models/Friend";


export enum FriendRequestType {
    REQUESTED = 'requested',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

export enum NotificationType {
    FRIEND_REQUEST = 'friendRequest'
}


export interface NotificationMenuItemProps {
    id: string;
    message: string;
    sentTime: Date;
    type: NotificationType | any;
    subType: FriendRequestType | any;
    iconUrl?: string;
    metadata?: any;
}

export const NotificationMenuItem = ({id, message, sentTime, type, subType, iconUrl, metadata}: NotificationMenuItemProps) => {
    return <div className="p-3 text-center font-sans text-base font-medium text-primary-slate flex justify-between items-center gap-5">
        <ProfilePhoto imgUrl={iconUrl} size="sm" />
        <div className="grow grid grid-cols-1 gap-2 justify-start">
            <div className="justify-self-start">{message}</div>
            {type === NotificationType.FRIEND_REQUEST && subType === FriendRequestType.REQUESTED && frindRequestHandler(id, metadata)}
            <div className="justify-self-end text-sm text-primary-blue font-medium font-sans">15 min ago</div>
        </div>
    </div>
}

const frindRequestHandler = (id: string, metadata: any) => {
    const addFriendChatPanel = useAddChatPanel();
    const [friendRequestStatus, setFriendRequestStatus] = useState<FriendRequestType>(FriendRequestType.REQUESTED);

    const acceptRequest = async(notificationId: string, reqMetadata: any, setFriendReqStatus: any) => {

        const response = await axios.post("http://localhost:3000/api/v1/friendRequest/accepted", {
              fromUserId: localStorage.getItem("USER_ID"),
              toUserId: reqMetadata.fromUserId,
              friendRequestId: reqMetadata.friendRequestId,
              status: FriendRequestType.ACCEPTED
          });

          const friendDetails: FriendDetails = response.data.friendshipDetails;
          addFriendChatPanel({userId: friendDetails.friendUserId, friendName: friendDetails.friendName, friendshipId: friendDetails.friendshipId, relationshipId: friendDetails.relationshipId, friendDpImgUrl: friendDetails.friendDpImgUrl, notificationCount: 1, messages: []} as ChatPanel);
          setFriendReqStatus(FriendRequestType.ACCEPTED);
          
          // remove notification here
      
          await axios.delete(`http://localhost:3000/api/v1/notificationId?${notificationId}`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
      }
      
      const rejectRequest = async(notificationId: string, reqMetadata: any, setFriendReqStatus: any) => {
          await axios.post("http://localhost:3000/api/v1/friendRequest/rejected", {
              fromUserId: localStorage.getItem("USER_ID"),
              toUserId: reqMetadata.fromUserId,
              friendRequestId: reqMetadata.friendRequestId,
              status: FriendRequestType.REJECTED
          });
      
          setFriendReqStatus(FriendRequestType.REJECTED);
      
          await axios.delete(`http://localhost:3000/api/v1/notification?${notificationId}`)
      }
      

    return <>
   {friendRequestStatus === FriendRequestType.REQUESTED ? <div className="flex justify-center items-center gap-3">
        <Button varient="blue" label="Accept" onClick={async() => await acceptRequest(id, metadata, setFriendRequestStatus)} />
        <Button varient="red" label="Reject" onClick={async() => await rejectRequest(id, metadata, setFriendRequestStatus)} />
    </div> : <div className="text-sm text-[rgba(255,255,255,0.5)] text-start italic font-light">Request {friendRequestStatus}</div>
 }
    </>
}