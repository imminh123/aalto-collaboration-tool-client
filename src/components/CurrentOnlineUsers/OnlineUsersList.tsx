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

  return (
    <div className="OnlineUsersList">
      <h2>Online Users</h2>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsersList;
