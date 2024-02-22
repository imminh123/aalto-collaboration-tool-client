import React, { useEffect, useState } from 'react';
import { IChannel } from '../../../types';
import MessageList from '../ChatBox/MessageList';
import ChatInput from '../ChatBox/ChatInput';
import './ChatScreen.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {useCallback} from 'react';


interface Props {
}


const ChatScreen: React.FC<Props> = () => {

  const [newMessage, setNewMessage] = useState('');
  useEffect(() => {
    if (!!newMessage) {
      console.log("com1",newMessage);
    }
  }, [newMessage]);
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
