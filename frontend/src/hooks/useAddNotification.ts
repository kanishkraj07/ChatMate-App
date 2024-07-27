import { useRecoilCallback, useSetRecoilState } from "recoil"
import { NotificationDetails, NotificationAtomFamily, NotificationIdsAtom } from "../store/atoms/NotificationAtom"

const useAddNotification: () => ((notificationDetails: NotificationDetails) => void) = () => {
    const setNotificationIdsAtom = useSetRecoilState(NotificationIdsAtom); 

   return useRecoilCallback(({set} ) => 
        (notificationDetails: NotificationDetails) => {
            setNotificationIdsAtom((ids) => [notificationDetails.notificationId, ...ids]);
            set(NotificationAtomFamily(notificationDetails.notificationId), notificationDetails)
        }
    )
};

export default useAddNotification;