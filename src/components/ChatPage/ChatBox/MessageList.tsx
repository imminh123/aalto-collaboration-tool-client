import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import secureStorage from "react-secure-storage";
import {
  decryptData,
  decryptMessage,
  findObjectWithProperty,
} from "../../../helpers/cryptography";
import "./MessageList.css";
import { generateRandomAvatar } from "../../../utils/helper";

const MessageList = () => {
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const messages = useSelector((state: any) => {
    return state.chat.messages;
  });
  const chatMode: number = useSelector((state: any) => state.channel.mode);
  const currentChannel = useSelector((state: any) => state.channel.channel);
  const receiverId = useSelector((state: any) => state.channel.directUserId);
  const userId = useSelector((state: any) => state.login.user_id);
  const directUserName = useSelector(
    (state: any) => state.channel.directUserName
  );
  const userKey: any = secureStorage.getItem(`${userId}:keyPair`) as object;

  function filterObjectsByPropertyValue<T>(
    items: T[],
    propertyName: keyof T,
    value: unknown
  ): T[] {
    return items.filter((item) => item[propertyName] === value);
  }

  function findObjectByProperty<T, K extends keyof T>(
    items: T[],
    propertyName: K,
    propertyValue: T[K]
  ): T | undefined {
    return items.find((item) => item[propertyName] === propertyValue);
  }

  function filterObjectsByTwoProperties<T>(
    items: T[],
    propertyName1: keyof T,
    value1: any,
    propertyName2: keyof T,
    value2: any
  ): T[] {
    return items.filter(
      (item) => item[propertyName1] === value1 && item[propertyName2] === value2
    );
  }

  function sortByOldestFirst(items: any): any {
    // @ts-ignore
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }

  async function decryptDirectMessages(messages: any) {
    let messagesToReturn: any = [];
    let aesKey: string = secureStorage.getItem(
      `dm_${userId}:${receiverId}`
    ) as string;
    // If the user is a reciever and it doesn't have information
    // about the AES key, and also there is at least one message
    // in the chat, then decrypt the recieved key, and store it for
    // the user
    if (!aesKey && messages.length != 0) {
      const messageWithKey: any = findObjectWithProperty(messages, "aesKey");
      aesKey = await decryptData(messageWithKey.aesKey, userKey.privateKey);
      secureStorage.setItem(`dm_${userId}:${receiverId}`, aesKey);
    }

    console.log(messages);

    // Necesearry data processing and message
    // decryption
    // @ts-ignore
    for (const element of messages) {
      messagesToReturn.push({
        receiverId: element.receiverId,
        senderName: element.senderName,
        timestamp: element.timestamp,
        senderId: element.senderId,
        chatMode: element.chatMode,
        content: await decryptMessage(element.content, aesKey),
      });
    }

    return sortByOldestFirst(messagesToReturn);
  }

  async function decryptChannelMessages(messages: any) {
    let aesKey: string = secureStorage.getItem(
      `ch_${currentChannel.channelId}`
    ) as string;
    if (!aesKey && messages.length != 0) {
      const messageWithKey: any = findObjectWithProperty(messages, "keys");
      if (!messageWithKey) {
        return null;
      }
      // @ts-ignore
      const keyObject = findObjectByProperty<any>(
        messageWithKey.keys,
        "userId",
        userId
      );
      if (!keyObject) return null;
      // @ts-ignore
      aesKey = await decryptData(keyObject.enryptedKey, userKey.privateKey);
      secureStorage.setItem(`ch_${currentChannel.channelId}`, aesKey);
    }

    let messagesToReturn: any = [];

    // @ts-ignore
    for (const element of messages) {
      messagesToReturn.push({
        messageId: element.messageId,
        senderName: element.senderName,
        senderId: element.senderId,
        chatMode: element.chatMode,
        content: await decryptMessage(element.content, aesKey),
      });
    }

    return sortByOldestFirst(messagesToReturn);
  }

  useEffect(() => {
    if (chatMode === 1) {
      const chatMode1Messages = filterObjectsByPropertyValue(
        messages,
        "chatMode",
        1
      );
      // @ts-ignore
      console.table([
        ...filterObjectsByTwoProperties<any>(
          chatMode1Messages,
          "receiverId",
          userId,
          "senderId",
          receiverId
        ),
        ...filterObjectsByTwoProperties<any>(
          chatMode1Messages,
          "senderId",
          userId,
          "receiverId",
          receiverId
        ),
      ]);

      // @ts-ignore
      let messagesThatWeNeedRecieved = filterObjectsByPropertyValue<any>(
        chatMode1Messages,
        "receiverId",
        userId
      );
      // @ts-ignore
      messagesThatWeNeedRecieved = filterObjectsByPropertyValue<any>(
        messagesThatWeNeedRecieved,
        "senderId",
        receiverId
      );
      // @ts-ignore
      let messagesThatWeNeedSent = filterObjectsByPropertyValue<any>(
        chatMode1Messages,
        "senderId",
        userId
      );
      // @ts-ignore
      messagesThatWeNeedSent = filterObjectsByPropertyValue<any>(
        messagesThatWeNeedSent,
        "senderId",
        receiverId
      );
      // @ts-ignore
      const toBeProcessedMessages = [
        ...filterObjectsByTwoProperties<any>(
          chatMode1Messages,
          "receiverId",
          userId,
          "senderId",
          receiverId
        ),
        ...filterObjectsByTwoProperties<any>(
          chatMode1Messages,
          "senderId",
          userId,
          "receiverId",
          receiverId
        ),
      ];
      decryptDirectMessages(toBeProcessedMessages)
        .then((data) => {
          setDecryptedMessages(data);
        })
        .catch((e) => {
          console.warn(e);
        });
    } else if (chatMode === 2) {
      // Do channel messages decryption
      const chatMode2Messages = filterObjectsByPropertyValue(
        messages,
        "chatMode",
        2
      );
      // @ts-ignore
      const thisChannelMessages = filterObjectsByPropertyValue<any>(
        chatMode2Messages,
        "channel",
        currentChannel.channelId
      );
      decryptChannelMessages(thisChannelMessages)
        .then((data) => {
          // @ts-ignore
          setDecryptedMessages(data);
        })
        .catch((e) => {
          console.warn(e);
        });
    }
  }, [chatMode, currentChannel, messages]);

  return (
    <>
      {/* {chatMode === 1 && (
        <div>
          <h2 className="channel_header font-bold py-2">{directUserName}</h2>
        </div>
      )} */}
      {chatMode === 2 && (
        <div>
          <h2 className="channel_header">
            Channel: {currentChannel.channelName}
          </h2>
        </div>
      )}

      {chatMode === 2 && (
        <div className="message_list">
          {decryptedMessages?.map((message: any) => (
            <div key={message.messageId} className="message">
              <strong>{message.senderName}</strong>: {message.content}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-800 p-4">
        {chatMode === 1 && (
          <>
            {decryptedMessages
              ?.filter(
                (m: any) =>
                  m.chatMode === 1 &&
                  ((userId === m.receiverId && m.senderId === receiverId) ||
                    (userId === m.senderId && m.receiverId === receiverId))
              )
              .map((message: any) => {
                if (message.senderId === userId) {
                  return (
                    <div className="flex items-center justify-start flex-row-reverse mb-2">
                      <div className="relative mr-3 text-sm bg-fuchsia-700 py-2 px-4 shadow rounded-xl">
                        <div>{message.content}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-row items-center mb-2">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                      {message.senderName}
                    </div>
                    <div className="relative ml-3 text-sm py-2 px-4 bg-gray-700 shadow rounded-xl">
                      <div>{message.content}</div>
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>
     
    </>
  );
};

export default MessageList;
