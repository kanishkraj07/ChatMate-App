import { CheckCheck } from "lucide-react"
import { MessageBody } from "../../models/ChatMessages"
import ConvertTime from "../../utils/ConvertTime";

const SentMessageBody = ({message, isSeen, date, isFollowedMsg}: MessageBody) => {
    return <div className={"w-fit max-w-96 bg-primary-green relative justify-start items-center px-2 py-1 flex leading-tight gap-3 rounded-md " + (!isFollowedMsg && " rounded-tr-none")}>
        <div className="min-w-40 max-w-96 text-lg font-sans font-medium text-primary-bg text-wrap">{message}</div>
        <div className="font-normal text-xs flex justify-end items-end gap-2 self-end">
            <div>{ConvertTime(new Date(date))}</div>
            <CheckCheck size={"20px"} color={isSeen ? '#167bba' : 'rgb(106, 113, 117)'} />
        </div>
        { !isFollowedMsg && <div className="absolute border-b-[15px] border-r-[15px] left-full top-0 border-b-primary-green border-r-transparent rotate-[-270deg]"></div>}
    </div>
}

export default SentMessageBody;