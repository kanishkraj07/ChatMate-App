import { CheckCheck } from "lucide-react";
import CountAlert from "./CountAlert";
import ProfilePhoto from "./ProfilePhoto";
import ConvertTime from "../utils/ConvertTime";
import { RecentMessageDetails, Sender } from "../models/ChatMessages";
import { ClientMessageType } from "../models/ClientMessage";

export interface ChatDetailsBoxProps {
name: string;
recentMessageDetails: RecentMessageDetails;
newMessagesCount?: number,
onClickFn: () => void;
imgUrl: string;
varient: ClientMessageType
}

const ChatDetailsBox = ({name, recentMessageDetails, newMessagesCount, onClickFn, varient, imgUrl}: ChatDetailsBoxProps) => {

    const convertDate = (date: Date): string => {
        return new Date(date).getDate() === new Date().getDate() ? ConvertTime(new Date(date)) : (new Date().getDate() - new Date(date).getDate() === 1 ? 'Yesterday' : new Date(date).toLocaleDateString('en-GB'))
    }

    return <button className="w-full bg-primary-bg-30 p-3 text-lg text-primary-slate font-medium hover:bg-[rgba(255,255,255,0.16)]" onClick={onClickFn}>
        <div className="container grid grid-cols-12 items-center">
            <div className="col-span-2">
               <ProfilePhoto varient={varient} imgUrl={imgUrl} />
            </div>
            <div className="flex flex-col col-span-8">
                <div className="self-start">{name}</div>
                <div className="flex justify-center items-center gap-3 self-start">
                   {varient === ClientMessageType.CHAT && recentMessageDetails.lastMessageSender === Sender.ME && newMessagesCount === 0 &&
                   <div>
                        <CheckCheck color={recentMessageDetails.isMessageSeen ? '#167bba' : 'rgb(106, 113, 117)'} />
                    </div>
                    }
                  <div className="line-clamp-1 font-extralight font-sans text-sm text-start">{ recentMessageDetails?.message ? ((varient === ClientMessageType.GROUP ? `~${recentMessageDetails.senderName}: ` : '') + recentMessageDetails.message) : ( varient === ClientMessageType.CHAT ? 'Hey! Chat with your new friend' : 'Start a conversation in this group')}</div>
                </div>
            </div>
            <div className="flex flex-col gap-3 col-span-2 justify-self-end">
            { <div className="font-extralight font-sans text-sm">{convertDate(recentMessageDetails?.messageDeliveryTime ?? new Date())}</div> }
                {varient === ClientMessageType.CHAT && newMessagesCount && newMessagesCount > 0 && <div className="self-end">
                    <CountAlert count={newMessagesCount} />
                </div>}
            </div>
        </div>
    </button>
}

export default ChatDetailsBox;