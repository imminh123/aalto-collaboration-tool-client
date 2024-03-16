import React, { useEffect, useState } from "react";
import "./OnlineUsersList.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../../redux/friendsReducer";
import { RootState } from "../../../redux";
import { setReceiverDetail } from "../../../redux/channelReducer";
import { generateRandomAvatar, truncateString } from "../../../utils/helper";

interface UserInterface {
  username: string;
  user_id: string;
}

const OnlineUsersList = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.login.user_id);

  const onlineUsers = useSelector(
    (state: RootState) => state.users.onlineUsers
  );
  const offlineUsers = useSelector(
    (state: RootState) => state.users.offlineUsers
  );


  useEffect(() => {
    const getOnlineUserPromise = dispatch(fetchAllUsers() as any);
    getOnlineUserPromise.then((res: any) => {
      setUsers(res.payload);
    });
  }, []);

  const handleSelectUser = (user: UserInterface) => {
    dispatch(setReceiverDetail(user));
  };

  return (
    <div className="online-users-list bg-gray-700 p-2 w-1/5">
      <div className="flex flex-row items-center justify-between text-xs">
        <span className="font-bold text-lg">Online</span>
        <span className="flex items-center justify-center text-black bg-gray-300 h-4 w-4 rounded-full">
          4
        </span>
      </div>
      <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
        {onlineUsers
          ?.filter((user: any) => user.user_id !== userId)
          .map((user: any) => (
            <button
              onClick={() => handleSelectUser(user)}
              key={user.user_id}
              className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
            >
              {generateRandomAvatar(user.username)}
              <div className="ml-2 text-sm font-semibold">{truncateString(user.username, 10)}</div>
            </button>
          ))}
      </div>

      <div className="flex flex-row items-center justify-between text-xs mt-6">
        <span className="font-bold text-lg">Offline</span>
        <span className="flex items-center justify-center text-black bg-gray-300 h-4 w-4 rounded-full">
          7
        </span>
      </div>
      {offlineUsers
        ?.filter((user: any) => user.user_id !== userId)
        .map((user: any) => (
          <button
            onClick={() => handleSelectUser(user)}
            key={user.user_id}
            className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
          >
            {generateRandomAvatar(user.username)}
            <div className="ml-2 text-sm font-semibold">{user.username}</div>
          </button>
        ))}
    </div>
  );
};

export default OnlineUsersList;
