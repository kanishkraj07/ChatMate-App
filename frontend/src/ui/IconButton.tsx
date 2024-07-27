import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IconButtonProps {
    icon: IconDefinition;
    text: string;
    onClick: () => void
}

export const IconButton = ({icon, text, onClick}: IconButtonProps) => {
    return <button onClick={onClick} className="w-full m-2 border bg-primary-slate text-md font-semibold p-2 rounded">
     <FontAwesomeIcon icon={icon} size="lg"/>
     <span className="w-full ml-2">{text}</span></button>
 }