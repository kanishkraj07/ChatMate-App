import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { CurrenActivePanelIdAtom } from "../store/atoms/ChatAtoms";

interface TextAreaBoxProps {
    placeholder: string,
    doClear?: boolean;
    setValue: (value: string) => void,
}

const TextAreaBox = ({placeholder, setValue, doClear}: TextAreaBoxProps) => {

    const textAreaInputRef = useRef<HTMLTextAreaElement>(null);
    const currentActiveChatPanel = useRecoilValue(CurrenActivePanelIdAtom);

    useEffect(() => {
        if(textAreaInputRef.current) {
            textAreaInputRef.current.value = '';
        }
    }, [currentActiveChatPanel, doClear]);

    return <div className="w-full h-12">
    <textarea ref={textAreaInputRef} onChange={(e) => {
        // if(textAreaInputRef.current) {
        //     textAreaInputRef.current.style.height = `auto`;
        //     textAreaInputRef.current.style.height = `${textAreaInputRef.current?.scrollHeight}px`;
        // }
        setValue(e.target.value);
    }} className="w-full h-full outline-0 text-[#f0f9ff] bg-primary-bg p-2 px-3 text-lg font-lg rounded-md focus:ring-2 focus:ring-inset resize-none textarea-placeholder" placeholder={placeholder}></textarea>
    </div>
}

export default TextAreaBox;