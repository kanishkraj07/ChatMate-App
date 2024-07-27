import axios from "axios";
import { atom, selector } from "recoil";

export const SearchQueryAtom = atom<string>({
    key: 'SearchQueryAtom',
    default: ''
});

export const FilteredUsers = selector({
    key: 'FilteredUsers',
    get: async ({get}) => {
      const response = await axios.get<{filteredUsers: FilteredUserDetails[]}>(`http://localhost:3000/api/v1/user/search?ref=${get(SearchQueryAtom)}`, {headers: {Authorization: `bearer ${localStorage.getItem('token')}`}});
      return response.data;
    }
});

export interface FilteredUserDetails {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    friends: any[];
    isFriends: boolean
}