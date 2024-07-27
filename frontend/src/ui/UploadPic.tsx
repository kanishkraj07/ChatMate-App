import { faArrowUpFromBracket, faPencil } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useState } from "react"

interface UploadPicProps {
    setFileData: (T: File) => void
}

const UploadPic = ({setFileData}: UploadPicProps) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string>('');

    const uploadFile = (fileData: any ) =>{
        const file: File = fileData?.target?.files?.[0];
        if(file) {
            const fr = new FileReader();
            fr.onload = () => {
                setUploadedPhoto(fr.result as string);
                setFileData(file);
            }
            fr.readAsDataURL(file);
        }
    }

    return <div className="size-40 rounded-full border border-rgba(255,255,255,0.1) text-center text-primary-slate bg-gray-300 flex justify-center items-center relative">
        <form onSubmit={uploadFile}>
            <label className="cursor-pointer">
                <FontAwesomeIcon icon={faArrowUpFromBracket} size="2xl" color="#1f2937" />
                <input ref={fileInputRef} type="file" id="file-upload" onChange={uploadFile} className="hidden" accept=".png,.jpg,.jpeg"></input>
            </label>
        </form> 
       { uploadedPhoto && <div className="absolute inset-0">
            <img className="size-40 rounded-full object-cover shadow-md" src={uploadedPhoto} alt="profile-pic"></img>
            <button className="absolute right-0 top-[85%]" onClick={() => fileInputRef.current?.click()}><FontAwesomeIcon icon={faPencil} size="lg" /></button>
        </div>}
    </div>
}

export default UploadPic