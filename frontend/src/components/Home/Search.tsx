import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchMenuItem from "../../ui/SearchMenuItem";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { FilteredUsers, SearchQueryAtom } from "../../store/atoms/UserAtom";
import { useEffect, useRef, useState } from "react";
import DialogBox from "../../ui/Dialog";
import { Search as SearchIcon, X } from 'lucide-react';



const Search = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const [isSearchOnFocus, setIsSearchOnFocus] = useState<boolean>(false);


    const makeSearchFocus = (): void => {
        setIsSearchOnFocus(true);
    }

    return <div className="col-span-2 flex flex-col"  onClick={makeSearchFocus}>
                <div ref={parentRef}  className="cursor-pointer flex justify-around items-center p-2 border border-[rgba(255,255,255,0.1)] rounded-xl text-base text-primary-slate" tabIndex={0}>
                    <div className="grow flex justify-center px-3 items-center gap-3 text-sm font-thin">
                        <button className="outline-0 border-0">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>

                        <div>Search Friends...</div>

                        <button className="text-md font-medium text-white border border-[rgba(255,255,255,0.1)] bg-[#454545] flex items-center justify-center rounded-md px-3 py-1 text-center font-sans">Ctrl k</button>
    
                    </div>
                    {isSearchOnFocus && <OpenSearchDialog  setIsSearchOnFocus={setIsSearchOnFocus} isSearchOnFocus={isSearchOnFocus} />  }
            </div> 
            
            </div>
}

const OpenSearchDialog = ({isSearchOnFocus, setIsSearchOnFocus}: any) => {

    const setSearchQuery = useSetRecoilState(SearchQueryAtom);
    const filteredUsersAtom = useRecoilValueLoadable(FilteredUsers);
    const searchResultsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchQuery("");
        console.log(isSearchOnFocus);
    }, []);

    useEffect(() => {
        if(searchResultsContainerRef.current) {
            searchResultsContainerRef.current.style.height = 'auto';
            searchResultsContainerRef.current.style.height = `${searchResultsContainerRef?.current?.scrollHeight}px`;
        }
    }, [filteredUsersAtom]);

    return <>
    <DialogBox isOpen={isSearchOnFocus} setIsOpen={setIsSearchOnFocus} isCenter={true}>
        <div className="w-full bg-primary-bg-30 grid grid-cols-1">
            <div className="flex justify-start items-center gap-5">
            <button className="outline-0 border-0 text-[rgba(255,255,255,0.9)] text-xl" > <SearchIcon  />
            </button>
            <input autoFocus className="w-[40vw] text-white outline-none border-none text-lg bg-primary-bg-30 placeholder:text-[rgba(255,255,255,0.5)] py-2 data-[focus]:ring-0" onChange={(e) => {
                    setSearchQuery(e.target.value)
                }} placeholder="Search to make Friends ..." ></input>
                <button className="outline-0 border-0 text-[rgba(255,255,255,0.9)] text-xl">
                    <X />
            </button>
            </div>
            <div ref={searchResultsContainerRef} className={'w-full right-0 rounded-tl-none rounded-tr-none max-h-[40vh] left-0 absolute top-full bottom-0 z-50 pb-2 overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.2)] bg-primary-bg-50 divide-y divide-[rgba(255,255,255,0.2)]'}>
            { (filteredUsersAtom.state === "hasValue" && filteredUsersAtom.contents.filteredUsers.length ? filteredUsersAtom.contents.filteredUsers.map(user => <SearchMenuItem userId={user.id} name={user.email} isFriend={user.isFriends} />) 
                      : <NoUsers/>) || filteredUsersAtom.state === "loading" && <div className="text-center p-2 text-sm text-[rgba(255,255,255,0.5)] font-light">loading...</div>}
            </div>
        </div>
    </DialogBox>
    </>

}

const NoUsers = () => {
    return <div className="text-center p-3 pb-0 flex justify-center items-center text-sm text-[rgba(255,255,255,0.5)] font-light">
        No Users Found
    </div>
}


export default Search;