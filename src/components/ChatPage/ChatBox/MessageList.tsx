import React, {useCallback, useEffect, useState} from 'react';
import './MessageList.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {useSelector, useDispatch} from 'react-redux';
import { decryptData } from '../../../helpers/cryptography';
import secureStorage from 'react-secure-storage';


const MessageList = () => {
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const messages = useSelector((state:any) => { return state.chat.messages; });
  const chatMode:number = useSelector((state:any) => state.channel.mode);
  const currentChannel = useSelector((state:any) => state.channel.channel);
  const receiverId = useSelector((state:any) => state.channel.directUserId);
  const userId = useSelector((state:any) => state.login.user_id);
  const directUserName = useSelector((state:any) => state.channel.directUserName);
  const userKey: any  = secureStorage.getItem(`${userId}:keyPair`) as object;

  async function decryptMessages(messages: any) {
    let messagesToReturn: any = [];
    // @ts-ignore
    for (let i = 0; i < messages.length; i++) {
      messagesToReturn.push({...messages[i]});
      if(messages[i].receiverId == userId && chatMode == 1) {
        messagesToReturn[i].content = await decryptData(messages[i].content_reciever, userKey.privateKey);
      } else if(messages[i].senderId == userId && chatMode == 1) {
        messagesToReturn[i].content = await decryptData(messages[i].content_sender, userKey.privateKey);
      }
    }

    return messagesToReturn;
  }

  useEffect(() => {
    decryptMessages(messages).then((data) => {
      setDecryptedMessages(data);
      console.log(data);
    }).catch((e) => {
      console.log(e)
    })    
  },[chatMode, currentChannel, messages]);


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
            {decryptedMessages && decryptedMessages
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
            {decryptedMessages && decryptedMessages.filter((m:any) => m.channelId === currentChannel.channelId && m.chatMode === 2).map((message:any) => (
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
