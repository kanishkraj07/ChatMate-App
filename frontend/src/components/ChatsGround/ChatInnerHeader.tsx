import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePhoto from "../../ui/ProfilePhoto";
import { faEllipsisVertical, faPhone, faVideo } from "@fortawesome/free-solid-svg-icons";

interface InnerChatGroundHeaderProps {
    friendName: string;
    imgUrl: string;
}

const ChatInnerHeader = ({friendName, imgUrl}: InnerChatGroundHeaderProps) => {
    return <div className="w-full bg-primary-tint-1 px-5 py-3 flex justify-between items-center">
        <div className="flex justify-start items-center gap-5 ">
            <ProfilePhoto imgUrl={imgUrl} size="sm" />
            <div className="text-[#fff] font-semibold text-lg font-sans">{friendName}</div>
        </div>
        <div className="flex justify-center items-center gap-7 text-primary-slate">
            <button><FontAwesomeIcon icon={faPhone} size="lg" /></button>
            <button><FontAwesomeIcon icon={faVideo} size="lg" /></button>
            <button><FontAwesomeIcon icon={faEllipsisVertical} size="lg" /></button>
        </div>
    </div>
}

export default ChatInnerHeader;