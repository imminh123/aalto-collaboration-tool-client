import React from 'react';
import MessageList from '../ChatBox/MessageList';
import ChatInput from '../ChatBox/ChatInput';
import './ChatScreen.css';
interface Props {
}

const ChatScreen: React.FC<Props> = () => {
  return (
    <div className="chat-screen">
      <MessageList 
      />
      <ChatInput 
      />
    </div>
  );
};

export default ChatScreen;
