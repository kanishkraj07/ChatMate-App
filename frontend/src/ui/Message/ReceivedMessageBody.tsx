import { CheckCheck } from "lucide-react"
import ConvertTime from "../../utils/ConvertTime"
import { MessageBody } from "../../models/ChatMessages"

const ReceivedMessageBody = ({message, isSeen, date, isFollowedMsg}: MessageBody) => {
    return <div className={"w-fit max-w-96 bg-light-primary-30 relative justify-start items-center text-primary-slate px-2 py-1 flex leading-tight gap-3  rounded-md " + (!isFollowedMsg && " rounded-tl-none")}>
        <div className="min-w-40 max-w-96 text-lg font-sans font-medium text-wrap">{message}</div>
        <div className="font-normal text-xs flex justify-end items-end gap-2 self-end">
            <div>{ConvertTime(new Date(date))}</div>
            <CheckCheck size={"20px"} color={isSeen ? '#167bba' : 'rgb(106, 113, 117)'} />
        </div>
       { !isFollowedMsg && <div className="absolute border-b-[15px] border-r-[15px] right-full top-0 border-b-light-primary-30 border-r-primary-bg-50 rotate-[-180deg]"></div> }
    </div>
}

export default ReceivedMessageBody;