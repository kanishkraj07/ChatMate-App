import { faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

interface ProfilePhotoProps {
    size?: string;
    name?: string;
    imgUrl?: string;
    varient?: string;
}

const ProfilePhoto = ({size, name, imgUrl, varient} : ProfilePhotoProps) => {
    return <div className={clsx('rounded-full cursor-pointer text-center text-primary-slate bg-gray-700 flex justify-center items-center size-12', size === 'xsm' && 'size-8', size==='sm' && 'size-10', size === '2xl' && 'size-32')}>
        {imgUrl ? <img className="object-cover rounded-full size-inherit" src={imgUrl} alt="">
        </img> :
        !name ? <FontAwesomeIcon className={clsx('size-8', size=== 'xsm' && 'size-4', size === 'sm' && 'size-6', size === '2xl' && 'size-20')} icon={varient === 'group' ? faPeopleGroup : faUser} /> 
        : <span className={clsx('text-xl mt-1', size === 'sm' && 'text-2xl')}>{name.charAt(0)}</span> }
    </div>
}

export default ProfilePhoto;