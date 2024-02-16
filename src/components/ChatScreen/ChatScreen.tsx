import React from 'react';
import { IChannel } from '../../types';
import MessageList from '../ChatBox/MessageList';
import ChatInput from '../ChatBox/ChatInput';
import './ChatScreen.css';

interface Props {
  channel: IChannel;
}

const onSend = (content: string) => {
  console.log(content);
}

const ChatScreen: React.FC<Props> = ({ channel }) => {
  return (
    <div className="chat-screen">
      <MessageList 
      // messages={channel.messages} 
      />
      <ChatInput 
      // onSend={(content) => console.log(content)} 
      />
    </div>
  );
};

export default ChatScreen;
