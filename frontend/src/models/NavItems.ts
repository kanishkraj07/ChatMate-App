import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { faUserGroup, faMessage } from "@fortawesome/free-solid-svg-icons";

export interface NavItem {
    name: string;
    icon: IconDefinition;
}

export const NAV_ITEMS: NavItem[] = [
    {
        name: 'Chats',
        icon: faMessage
    },
    {
        name: 'Groups',
        icon: faUserGroup
    }
]