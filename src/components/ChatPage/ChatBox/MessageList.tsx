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
  const directUserName = useSelector((state:any) => state.channel.directUserName);

  useEffect(() => {
    
  },[chatMode, currentChannel]);

  return (
    <>
      {chatMode === 1 && <div>
        <h2 className='channel_header'>Direct Message To {directUserName}</h2>
        </div>}
      {chatMode === 2 && <div>
        <h2 className='channel_header'>Channel: {currentChannel.channelName}</h2>
        </div>}
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
            {messages && messages.filter((m:any) => m.channel.channelId === currentChannel.channelId && m.chatMode === 2).map((message:any) => (
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
