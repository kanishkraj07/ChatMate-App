import { NotificationPayload } from "../models/notification";

class NotificationManager {

    private static instance: NotificationManager;

    private constructor() {
    }

    public static getInstance(): NotificationManager {
        if(!this.instance) {
            this.instance = new NotificationManager();
        }
         return this.instance;
    }

    public getNotificationPayload(type: string, subType: string, payload: any): NotificationPayload {
        return {
            type,
            subType,
            payload
           } as NotificationPayload
    }
}

export default NotificationManager;