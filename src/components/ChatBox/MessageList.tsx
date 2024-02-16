import React from 'react';
// import './MessageList.css'; // Create and import CSS for MessageList

const MessageList = () => {
  // Placeholder messages
  const messages = [
    { id: 1, user: 'User1', content: 'Hello!' },
    { id: 2, user: 'User2', content: 'Hi, how are you?' },
    // More messages...
  ];

  return (
    <div className="MessageList">
      {messages.map((message) => (
        <div key={message.id} className="message">
          <strong>{message.user}</strong>: {message.content}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
