import React, {useCallback, useEffect, useState} from 'react';
import './MessageList.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {useSelector, useDispatch} from 'react-redux';
import { decryptData, decryptMessage, findObjectWithProperty } from '../../../helpers/cryptography';
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
    let aesKey: string = secureStorage.getItem(`dm_${userId}:${receiverId}`) as string; 
    // If the user is a reciever and it doesn't have information
    // about the AES key, and also there is at least one message
    // in the chat, then decrypt the recieved key, and store it for
    // the user
    if(!aesKey && messages.length != 0) {
      const messageWithKey: any = findObjectWithProperty(messages, "aesKey");
      console.log(messageWithKey);
      aesKey = await decryptData(messageWithKey.aesKey, userKey.privateKey);
      secureStorage.setItem(`dm_${userId}:${receiverId}`, aesKey);
    }

    // Necesearry data processing and message
    // decryprion
    // @ts-ignore
    for (let i = 0; i < messages.length; i++) {      
      messagesToReturn.push({
        receiverId: messages[i].receiverId, 
        senderName: messages[i].senderName,
        senderId: messages[i].senderId,
        chatMode: messages[i].chatMode,
        content: await decryptMessage(messages[i].content, aesKey)
      })
    }

    return messagesToReturn;
  }

  useEffect(() => {
    decryptMessages(messages).then((data) => {
      setDecryptedMessages(data);
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
