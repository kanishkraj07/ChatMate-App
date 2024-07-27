import { atom } from "recoil";

const WebSocketAtom = atom({
    key: 'WebSocketAtom',
    default: {} as WebSocket
});

export default WebSocketAtom;