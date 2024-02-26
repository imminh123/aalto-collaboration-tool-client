import React, { useEffect, useState } from 'react';
import './OnlineUsersList.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../../redux/friendsReducer';
import { RootState } from '../../../redux';
import {setReceiverDetail} from '../../../redux/channelReducer';

interface UserInterface {
  username: string;
  user_id: string;
}

const OnlineUsersList = () => {
  const [users, setUsers] = useState([])
  const dispatch = useDispatch();
  const userId = useSelector((state:RootState) => state.login.user_id);
  const onlineUsers = useSelector((state:RootState) => state.users.onlineUsers);
  const offlineUsers = useSelector((state:RootState) => state.users.offlineUsers);

  useEffect(() => {
    const getOnlineUserPromise = dispatch(fetchAllUsers() as any);
      getOnlineUserPromise.then((res: any) => {
        setUsers(res.payload);
      })
  } , []);

  const handleSelectUser = (user:UserInterface) => {
    dispatch(setReceiverDetail(user));
  }

  return (
    <div className="online-users-list">
      <div className='online_user_header' >Online Users</div>
        {onlineUsers?.filter((user:any) => user.user_id !== userId).map((user:any) => (
          <div 
            className={`user_row`} key={user.user_id}
            onClick={() => handleSelectUser(user)}
          >
            <span className={`user_circle user_green_circle`}></span>
            <div>{user.username}</div>
          </div>
        ))}
        {offlineUsers?.filter((user:any) => user.user_id !== userId).map((user:any) => (
          <div 
            className={`user_row`} key={user.user_id}
            onClick={() => handleSelectUser(user)}
          >
            <span className={`user_circle user_circle_empty`}></span>
            <div>{user.username}</div>
          </div>
        ))}
    </div>
  );
};

export default OnlineUsersList;
