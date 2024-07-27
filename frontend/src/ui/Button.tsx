
import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    varient?: string;
    icon?: IconDefinition;
}
export const Button = ({label, onClick, varient, icon}: ButtonProps) => {
    return <button className={clsx("w-full text-center rounded-md px-3 py-1 text-sm font-semibold border-none outline-none flex justify-center items-center gap-1",  varient === "red" && "bg-[#fecdd3] text-[#e11d48]",  varient === "green" && "bg-[#bbf7d0] text-[#14532d]", 
        varient === "blue" && "bg-[#bae6fd] text-[#0c4a6e]")} onClick={onClick}>
        {label}
        {icon && <FontAwesomeIcon icon={icon} /> }
    </button>
}