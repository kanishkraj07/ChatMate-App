import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { Bell } from "lucide-react"
import { NotificationMenuItem } from "../../ui/NotificationMenuItem"
import { useRecoilValue } from "recoil"
import { GlobalNotificationCountAtom, NotificationAtomFamily, NotificationDetails, NotificationIdsAtom } from "../../store/atoms/NotificationAtom"
import WebSocketAtom from "../../store/atoms/WebSocketAtom"
import { useEffect, useRef } from "react"

export const Notifications = () => {
    
    const webSocket: WebSocket = useRecoilValue(WebSocketAtom);
    const globalNotificationCount: number = useRecoilValue(GlobalNotificationCountAtom);
    const notificationIdsAtom = useRecoilValue(NotificationIdsAtom);
    const notificationsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(notificationsContainerRef.current) {
            notificationsContainerRef.current.style.height = 'auto';
            notificationsContainerRef.current.style.height = `${notificationsContainerRef?.current?.scrollHeight}px`;
        }
        console.log(notificationsContainerRef?.current?.scrollHeight)
    }, [notificationIdsAtom]);
    
    const seenAllNotifications = () => {
        // send websocket message to update seen value of all global notifications
    }

    return <div className="self-end">
                <Popover>
                    <div className="relative">
                        <PopoverButton className="outline-none" onClick={seenAllNotifications}><Bell color="white" size="30" /></PopoverButton>
                        {globalNotificationCount > 0 && <div className="size-6 bottom-[50%] left-[50%] p-1 font-semibold text-primary-bg-30 flex justify-center items-center text-sm rounded-full bg-primary-green absolute">
                            <span className="mt-1">{globalNotificationCount}</span>
                        </div>}
                        <PopoverPanel anchor="bottom end" className="w-1/4">
                        <div ref={notificationsContainerRef}  className="w-full h-fit max-h-[50vh] overflow-y-scroll divide-y bg-primary-bg rounded-lg divide-[rgba(255,255,255,0.2)]">
                            <div className="py-3 px-2 text-center text-base font-semibold text-primary-slate">Notifications</div>
                            {notificationIdsAtom?.length ? notificationIdsAtom.map(notificationId => 
                                   <NotificationMenuRenderer notificationId={notificationId} />)
                                    :  <div className="py-3 px-2 text-center text-base font-thin text-primary-gray">Notifications are Empty</div>}
                            </div>
                        </PopoverPanel>
                    </div>
                </Popover>
            </div>

}

const NotificationMenuRenderer = ({notificationId}: {notificationId: string}) => {

    const notificationDetails: NotificationDetails = useRecoilValue(NotificationAtomFamily(notificationId));

    return <NotificationMenuItem id={notificationDetails.notificationId} type={notificationDetails.type} subType={notificationDetails.subType} message={notificationDetails.message} iconUrl={notificationDetails.iconUrl} sentTime={notificationDetails.sentTime} metadata={notificationDetails?.metadata || ''}/>
}