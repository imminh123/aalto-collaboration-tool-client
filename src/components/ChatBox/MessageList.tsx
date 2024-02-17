import React from 'react';
import './MessageList.css'; // Create and import CSS for MessageList

const MessageList = () => {
  // Placeholder messages
  const messages = [
    { id: 1, user: 'User1', content: 'Hello!' },
    { id: 2, user: 'User2', content: 'Hi, how are you?' },
    { id: 3, user: 'User2', content: 'Hi, how are you?' },
    { id: 4, user: 'User2', content: 'Hi, how are you?' },
    { id: 5, user: 'User2', content: 'Hi, how are you?' },
    { id: 6, user: 'User2', content: 'Hi, how are you?' },
    { id: 7, user: 'User2', content: 'Hi, how are you?' },
    { id: 8, user: 'User2', content: 'Hi, how are you?' },
    { id: 9, user: 'User2', content: 'Hi, how are you?' },
    { id: 10, user: 'User2', content: 'Hi, how are you?' },
    { id: 11, user: 'User2', content: 'Hi, how are you?' },
    { id: 12, user: 'User2', content: 'Hi, how are you?' },
    { id: 13, user: 'User2', content: 'Hi, how are you?' },
    { id: 14, user: 'User2', content: 'Hi, how are you?' },
    { id: 15, user: 'User2', content: 'Hi, how are you?' },
    { id: 16, user: 'User2', content: 'Hi, how are you?' },
    { id: 17, user: 'User2', content: 'Hi, how are you?' },
    { id: 18, user: 'User2', content: 'Hi, how are you?' },
    { id: 19, user: 'User2', content: 'Hi, how are you?' },
    { id: 20, user: 'User2', content: 'Hi, how are you?' },
    { id: 21, user: 'User2', content: 'Hi, how are you?' },
    // More messages...
  ];

  return (
    <div className="message_list">
      {messages.map((message) => (
        <div key={message.id} className="message">
          <strong>{message.user}</strong>: {message.content}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
