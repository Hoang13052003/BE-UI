import { useState, useCallback } from "react";
import { message } from "antd";
import debounce from "lodash/debounce";
import { searchUsersByEmailOrUsernameApi } from "../api/userApi";
import { UserIdAndEmailResponse } from "../types/User";

interface UseUserSearchReturn {
  searchedUsers: UserIdAndEmailResponse[];
  searchLoading: boolean;
  handleUserSearch: (value: string) => void;
  resetSearch: () => void;
}

export const useUserSearch = (
  minSearchLength = 2,
  debounceTime = 200
): UseUserSearchReturn => {
  const [searchedUsers, setSearchedUsers] = useState<UserIdAndEmailResponse[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchUsers = useCallback(
    debounce(async (searchValue: string) => {
      if (!searchValue || searchValue.length < minSearchLength) {
        setSearchedUsers([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await searchUsersByEmailOrUsernameApi({
          "searchTerm.contains": searchValue,
          page: 0,
          size: 10,
        });
        setSearchedUsers(response.users);
      } catch (error) {
        console.error("Error searching users:", error);
        message.error("Failed to search users");
      } finally {
        setSearchLoading(false);
      }
    }, debounceTime),
    [minSearchLength, debounceTime]
  );

  const handleUserSearch = useCallback(
    (value: string) => {
      debouncedSearchUsers(value);
    },
    [debouncedSearchUsers]
  );

  const resetSearch = useCallback(() => {
    setSearchedUsers([]);
  }, []);

  return {
    searchedUsers,
    searchLoading,
    handleUserSearch,
    resetSearch,
  };
};
