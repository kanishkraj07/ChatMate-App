import axios from "axios";
import { Button } from "./Button";
import ProfilePhoto from "./ProfilePhoto";

interface SearchMenuItemProps {
    name: string;
    isFriend?: boolean;
    userId: string;
}

const sendFriendRequest = async (toUserId: string) => {
    axios.post("http://localhost:3000/api/v1/friendRequest/requested", {
        toUserId,
        fromUserId: localStorage.getItem("USER_ID") || '',
        status: 'requested'
    });
}

const SearchMenuItem = ({name, isFriend, userId}: SearchMenuItemProps) => {
    return <div>
        <div className="w-full bg-primary-bg-30 gap-3 p-5 flex justify-between items-center hover:bg-gray-700">
            <div className="flex items-center gap-3">
                <ProfilePhoto size="xsm" name={name} />
                <div className="text-base text-primary-slate font-medium text-ellipsis">{name}</div>
            </div>
            <div className="cursor-pointer">
                { !isFriend && <Button label={"Send Request"} varient="blue" onClick={() => sendFriendRequest(userId)}/>}
                { isFriend &&  <Button label={"Friends"} varient="green"/> }
            </div>
        </div>
    </div>
}


//  <UserPlus color="#e5e7eb" size='24'
{/* <UserCheck color="#00FF00" size='24' */}

export default SearchMenuItem;