"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotificationManager {
    constructor() {
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationManager();
        }
        return this.instance;
    }
    getNotificationPayload(type, subType, payload) {
        return {
            type,
            subType,
            payload
        };
    }
}
exports.default = NotificationManager;
