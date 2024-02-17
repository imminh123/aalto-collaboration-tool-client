import React from 'react';
import './OnlineUsersList.css'; // Create and import CSS for OnlineUsersList

const OnlineUsersList = () => {
  // Placeholder online users
  const onlineUsers = [
    'User1',
    'User2',
    'User3',
    // More users...
  ];

  const offlineUsers = [
    'User4',
    'User5',
  ];

  return (
    <div className="online-users-list">
      <div className='online_user_header' >Online Users</div>
        {onlineUsers.map((user) => (
          <div className={`user_row`} key={user}>
            <span className={`user_circle user_green_circle`}></span>
            <div>{user}</div>
          </div>
        ))}
      {offlineUsers.map((user) => (
        <div className={`user_row`} key={user}>
          <span className={`user_circle user_circle_empty`}></span>
          <div>{user}</div>
        </div>
      ))}
    </div>
  );
};

export default OnlineUsersList;
