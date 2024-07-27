import { Suspense, useEffect, useState } from "react";
import { Button } from "../../ui/Button";
import DialogBox from "../../ui/Dialog";
import { LineInputBox } from "../../ui/LineInput";
import useAsync from "../../hooks/useAsync";
import axios, { AxiosResponse } from "axios";
import { FriendProfile } from "../../models/Friend";
import { useRecoilState } from "recoil";
import { SelectedFriendsListAtom } from "../../store/atoms/FriendAtom";
import CheckBox from "../../ui/Checkbox";
import ProfilePhoto from "../../ui/ProfilePhoto";
import { Group } from "../../models/Group";
import { useAddGroup } from "../../hooks/useAddGroup";
import UploadPic from "../../ui/UploadPic";

const CreateGroupDialog = () => {

    const [isOpenCreateGroupDialog, setIsOpenCreateGroupDialog] = useState<boolean>(false);
    const [groupName, setGroupName] = useState<string>();
    const [fileData, setFileData] = useState<File>();
    const addGroup = useAddGroup();

    const selectedFriendsMap = new Map<string, boolean>();


    const openCreateGroupDialog = () => {
        setIsOpenCreateGroupDialog(true);
    }

    const createGroup = async () => {
        const members: string[] = [];
        for(let [key, value] of selectedFriendsMap) {
           members.push(key);
        }

        members.push(localStorage.getItem('USER_ID') || '');

        const formData = new FormData();

        formData.append('ownerId', localStorage.getItem('USER_ID') || '');
        formData.append('name', groupName || '');
        formData.append('members', members.join(', '));
        formData.append('Group_Icon', fileData || '')

        const response: AxiosResponse<{groupDetails: Group}> = await axios.post<{groupDetails: Group}>('http://localhost:3000/api/v1/group/create',
            formData, 
        {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`, "Content-Type": 'multipart/form-data'}});
        addGroup(response.data.groupDetails);
        setIsOpenCreateGroupDialog(false);
    }
    
    return <>
    <div className="w-40">
        <Button label="Create Group" varient="red" onClick={openCreateGroupDialog} />
    </div>

        <DialogBox isOpen={isOpenCreateGroupDialog} setIsOpen={setIsOpenCreateGroupDialog}>
            <div className="w-full flex flex-col justify-start items-center">
                <div className="w-full mt-5 flex flex-col justify-center items-center gap-5">
                    <UploadPic setFileData={setFileData} />
                    <LineInputBox type="text" placeholder="Group Name" setValue={setGroupName} />
                    <LineInputBox type="text" placeholder="Subject" setValue={setGroupName} />
                    <AddMembersRenderer selectedFriendsMap={selectedFriendsMap} />
                    <div className="w-full">
                        <Button label="Create" varient="green" onClick={createGroup}/>
                    </div>
                </div>
            </div>
        </DialogBox>

    </>
};

const AddMembersRenderer = ({selectedFriendsMap}: {selectedFriendsMap: Map<string, boolean>}) => {
  const [friendsList, setFriendsListAtom] = useRecoilState(SelectedFriendsListAtom);

   const doneLoading: boolean = useAsync<{friends: FriendProfile[]}>(
    () => axios.get("http://localhost:3000/api/v1/user/friends", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}) as Promise<{friends: FriendProfile[]}>,
      (response: {friends: FriendProfile[]}) => {
        response.friends?.forEach((friend: FriendProfile) =>  selectedFriendsMap.set(friend.id, false));
        setFriendsListAtom(response.friends);
      }, (error) => {});

    return<>
   { doneLoading ? <div className="w-full mx-3">
        {friendsList?.length ?
      friendsList.map((friend: FriendProfile, index) => <AddMember key={index} member={friend} selectedFriendsMap={selectedFriendsMap} />)  : <div className="text-sm text-white text-center w-full">No Friends to Add</div>}
    </div> : <div className="w-full text-sm italic text-primary-gray text-center">Loading friends ...</div> }
    </>
}


const AddMember = ({member, selectedFriendsMap}: {member: FriendProfile, selectedFriendsMap: Map<string, boolean>}) => {
    const [check, setCheck] = useState<boolean>(false);

    useEffect(() => {
        if(check) {
            selectedFriendsMap.set(member.id, check)
        } else {
            selectedFriendsMap.has(member.id) ? selectedFriendsMap.delete(member.id) : null
        }
    }, [check])

    return <div className="w-full grid grid-cols-2 justify-center items-center px-3 py-5">
        <div className="flex justify-center items-center place-self-start gap-3">
            <ProfilePhoto name={member.userName ?? member.email} size="sm" />
            <div className="flex flex-col gap-2 items-start justify-center">
                <p className="text-base text-primary-slate font-bold">{member.userName}</p>
                <p className="text-sm text-gray-400 font-sans font-medium">{member.email}</p>
            </div>
        </div>
        <div className="w-20 self-center justify-self-end flex justify-end">
         <CheckBox check={check} setCheck={setCheck} />
        </div>
    </div>
}

export default CreateGroupDialog;