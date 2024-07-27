import { useRecoilValue } from "recoil";
import ProfilePhoto from "../../ui/ProfilePhoto";
import { Notifications } from "./Notifications";
import Search from "./Search";
import UserDetailsAtom, { UserDetails } from "../../store/atoms/UserDetailsAtom";
import { NAV_ITEMS, NavItem } from "../../models/NavItems";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

 const Header = () => {

    const userDetails: UserDetails = useRecoilValue(UserDetailsAtom);

    return <>
    <div className="w-full grid grid-cols-10 justify-center place-items-center p-5 pb-2 border-b bg-primary-bg-30 border-none">
        <div className="col-span-1 text-2xl font-medium text-primary-slate">Chat<span className="text-primary-green">Mate</span></div>
        <nav className="col-span-2 flex items-center gap-10">
                {NAV_ITEMS.map((navItem: NavItem) =>
                <div className='w-fit'> 
                    <NavLink className={'nav-item'} to={`${navItem.name.toLowerCase()}`}>
                    <FontAwesomeIcon icon={navItem.icon} />{navItem.name}
                    </NavLink>
                </div>)}
                </nav>
        <Search />   
        <div className="col-span-5 justify-self-end w-40 flex justify-center items-center gap-7">
        <Notifications />
        <ProfilePhoto imgUrl={userDetails.profileImgUrl} />
        </div>
    </div>
    </>
}

export default Header;