import React, {useCallback, useEffect, useState} from 'react';
import './MessageList.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {useSelector, useDispatch} from 'react-redux';


const MessageList = () => {
  const messages = useSelector((state:any) => state.chat.messages);
  const chatMode:number = useSelector((state:any) => state.channel.mode);
  const currentChannel = useSelector((state:any) => state.channel.channel);
  const receiverId = useSelector((state:any) => state.channel.directUserId);
  const userId = useSelector((state:any) => state.login.user_id);
  useEffect(() => {
    
  },[chatMode, currentChannel]);

  return (
    <>
      {chatMode === 1 && 
        <>
          <div className="message_list">
            {messages && messages
            .filter((m:any) => 
              m.chatMode === 1 && 
              ((userId === m.receiverId && m.senderId === receiverId) ||
              (userId === m.senderId && m.receiverId === receiverId))
            )
            .map((message:any) => (
              <div key={message.messageId} className="message">
                <strong 
                >{message.senderName}</strong>: {message.content}
              </div>
            ))}
          </div>
        </>
      }
      {chatMode === 2 && 
        <>
          <div className="message_list">
            {messages && messages.filter((m:any) => m.channel === currentChannel && m.chatMode === 2).map((message:any) => (
              <div key={message.messageId} className="message">
                <strong 
                >{message.senderName}</strong>: {message.content}
              </div>
            ))}
          </div>
        </>
      }
    </>
  );
};

export default MessageList;