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

  function filterObjectsByPropertyValue<T>(items: T[], propertyName: keyof T, value: unknown): T[] {
    return items.filter(item => item[propertyName] === value);
  }

  function findObjectByProperty<T, K extends keyof T>(items: T[], propertyName: K, propertyValue: T[K]): T | undefined {
    return items.find(item => item[propertyName] === propertyValue);
  }

  function filterObjectsByTwoProperties<T>(
    items: T[],
    propertyName1: keyof T,
    value1: unknown,
    propertyName2: keyof T,
    value2: unknown
  ): T[] {
    return items.filter(item => item[propertyName1] === value1 && item[propertyName2] === value2);
  }
  
  function sortByOldestFirst(items: any): any {
    // @ts-ignore
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  async function decryptDirectMessages(messages: any) {
    let messagesToReturn: any = [];
    let aesKey: string = secureStorage.getItem(`dm_${userId}:${receiverId}`) as string; 
    // If the user is a reciever and it doesn't have information
    // about the AES key, and also there is at least one message
    // in the chat, then decrypt the recieved key, and store it for
    // the user
    if(!aesKey && messages.length != 0) {
      const messageWithKey: any = findObjectWithProperty(messages, "aesKey");
      aesKey = await decryptData(messageWithKey.aesKey, userKey.privateKey);
      secureStorage.setItem(`dm_${userId}:${receiverId}`, aesKey);
    }

    console.log(messages);

    // Necesearry data processing and message
    // decryption
    // @ts-ignore
    for (let i = 0; i < messages.length; i++) {      
      messagesToReturn.push({
        receiverId: messages[i].receiverId, 
        senderName: messages[i].senderName,
        timestamp: messages[i].timestamp,
        senderId: messages[i].senderId,
        chatMode: messages[i].chatMode,
        content: await decryptMessage(messages[i].content, aesKey)
      })
    }

    return sortByOldestFirst(messagesToReturn);
  }

  async function decryptChannelMessages(messages: any) {
    let aesKey: string = secureStorage.getItem(`ch_${currentChannel.channelId}`) as string; 
    if(!aesKey && messages.length != 0) {
      const messageWithKey: any = findObjectWithProperty(messages, "keys");
      if(!messageWithKey) {
        return null;
      }
      // @ts-ignore
      const keyObject = findObjectByProperty(messageWithKey.keys, 'userId', userId);
      if(!keyObject) return null;
      // @ts-ignore
      aesKey = await decryptData(keyObject.enryptedKey, userKey.privateKey);
      secureStorage.setItem(`ch_${currentChannel.channelId}`, aesKey);
    }

    let messagesToReturn = [];

    // @ts-ignore
    for (let i = 0; i < messages.length; i++) {      
      messagesToReturn.push({ 
        messageId: messages[i].messageId,
        senderName: messages[i].senderName,
        senderId: messages[i].senderId,
        chatMode: messages[i].chatMode,
        content: await decryptMessage(messages[i].content, aesKey)
      })
    }

    return sortByOldestFirst(messagesToReturn);
  }

  useEffect(() => {
    if(chatMode === 1) {
      const chatMode1Messages = filterObjectsByPropertyValue(messages, 'chatMode', 1);
      // @ts-ignore
      console.table([...filterObjectsByTwoProperties(chatMode1Messages, 'receiverId', userId, 'senderId', receiverId), ...filterObjectsByTwoProperties(chatMode1Messages, 'senderId', userId, 'receiverId', receiverId)]);

      // @ts-ignore
      let messagesThatWeNeedRecieved = filterObjectsByPropertyValue(chatMode1Messages, 'receiverId', userId);
      // @ts-ignore
      messagesThatWeNeedRecieved = filterObjectsByPropertyValue(messagesThatWeNeedRecieved, 'senderId', receiverId);
      // @ts-ignore
      let messagesThatWeNeedSent = filterObjectsByPropertyValue(chatMode1Messages, 'senderId', userId);
      // @ts-ignore
      messagesThatWeNeedSent = filterObjectsByPropertyValue(messagesThatWeNeedSent, 'senderId', receiverId);
      // @ts-ignore
      const toBeProcessedMessages = [...filterObjectsByTwoProperties(chatMode1Messages, 'receiverId', userId, 'senderId', receiverId), ...filterObjectsByTwoProperties(chatMode1Messages, 'senderId', userId, 'receiverId', receiverId)]
      decryptDirectMessages(toBeProcessedMessages).then((data) => {
        setDecryptedMessages(data);
        console.log(data);
      }).catch((e) => {
        console.warn(e)
      })    
    } else if (chatMode === 2) {
      // Do channel messages decryption
      const chatMode2Messages = filterObjectsByPropertyValue(messages, 'chatMode', 2);
      // @ts-ignore
      const thisChannelMessages = filterObjectsByPropertyValue(chatMode2Messages, 'channel', currentChannel.channelId);
      decryptChannelMessages(thisChannelMessages).then((data) => {
        // @ts-ignore
        setDecryptedMessages(data);
      })
      .catch((e) => {
        console.warn(e);
      });
    }
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
            {decryptedMessages && decryptedMessages.map((message:any) => (
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
