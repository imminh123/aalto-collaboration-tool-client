import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
// import secureStorage from "react-secure-storage";
import {
  decryptData,
  decryptMessage,
  findObjectWithProperty,
} from "../../../helpers/cryptography";
import "./MessageList.css";
import {
  filterObjectsByPropertyValue,
  filterObjectsByTwoProperties,
  findObjectByProperty,
  generateRandomAvatar,
  getBackgroundColor,
  secureStorage,
} from "../../../utils/helper";
import { useParams } from "react-router-dom";
import { CHAT_MODE } from "../../../config/constant";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const MessageList = () => {
  const { mode, userid: receiverId } = useParams();
  const chatMode = Number(mode);
  const [decryptedMessages, setDecryptedMessages] = useState([]);

  const messages = useSelector((state: any) => {
    return state.chat.messages;
  });
  // const chatMode: number = useSelector((state: any) => state.channel.mode);
  const currentChannel = useSelector((state: any) => state.channel.channel);
  // const receiverId = useSelector((state: any) => state.channel.directUserId);
  const userId = useSelector((state: any) => state.login.user_id);
  const directUserName = useSelector(
    (state: any) => state.channel.directUserName
  );
  const userKey: any = JSON.parse(
    secureStorage.getItem(`${userId}:keyPair`) || ""
  );

  const messageListRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

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
        ...(element.isFile && { isFile: element.isFile }),
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
    if (chatMode === CHAT_MODE.DIRECT) {
      // const chatMode1Messages = filterObjectsByPropertyValue(
      //   messages,
      //   "chatMode",
      //   1
      // );

      // @ts-ignore
      let messagesThatWeNeedRecieved = filterObjectsByPropertyValue<any>(
        messages,
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
        messages,
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
          messages,
          "receiverId",
          userId,
          "senderId",
          receiverId
        ),
        ...filterObjectsByTwoProperties<any>(
          messages,
          "senderId",
          userId,
          "receiverId",
          receiverId
        ),
      ];
      decryptDirectMessages(toBeProcessedMessages)
        .then((data) => {
          setDecryptedMessages(
            data.filter(
              (m: any) =>
                m.chatMode === CHAT_MODE.DIRECT &&
                ((userId === m.receiverId && m.senderId === receiverId) ||
                  (userId === m.senderId && m.receiverId === receiverId))
            )
          );
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (chatMode === CHAT_MODE.CHANNEL) {
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

    // auto scroll bottom when there're new messages
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current?.scrollHeight;
    }
  }, [chatMode, currentChannel, messages]);

  // Function to handle the file download
  const handleDownload = async (object_name: string) => {
    try {
      setStartTime(Date.now());
      setProgress(0);
      setDownloadSpeed(0);

      const response = await fetch(
        `http://localhost:8000/download-file/${object_name}`,
        {
          method: "GET",
        }
      );
      const reader = response?.body?.getReader();
      let receivedLength = 0;
      let intervalStartTime = Date.now();

      // Create a new Blob to hold the downloaded file
      const fileBlob: any = [];
      while (true) {
        const { done, value } = await reader!.read();
        if (done) {
          break;
        }

        receivedLength += value.length;
        setProgress(receivedLength);

        // Calculate download speed every 1 second
        if (Date.now() - intervalStartTime >= 1000) {
          const intervalEndTime = Date.now();
          const durationInSeconds = (intervalEndTime - startTime) / 1000;
          const bytesPerSecond = receivedLength / durationInSeconds;
          const bitsPerSecond = bytesPerSecond * 8;
          setDownloadSpeed(bitsPerSecond);
          intervalStartTime = intervalEndTime;
        }

        fileBlob.push(value);
      }

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob(fileBlob));
      // Create an anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", object_name); // Set the filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const messageFormat = (message) => {
    if (message.isFile) {
      return (
        <div className="flex items-center">
          <AttachFileIcon className="mr-1" fontSize="small" />
          {message.content}{" "}
          <div
            className="bg-white rounded-full w-8 h-8 flex items-center justify-center ml-2 cursor-pointer"
            onClick={() => handleDownload(message.content)}
          >
            <DownloadIcon color="primary" />
          </div>{" "}
        </div>
      );
    }
    return <div>{message.content}</div>;
  };
  const messageItem = (message) => {
    if (message.senderId === userId) {
      return (
        <div className="flex items-center justify-start flex-row-reverse mb-2">
          <div className="relative mr-3 text-sm bg-fuchsia-700 py-2 px-4 shadow rounded-xl">
            {messageFormat(message)}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-row items-center mb-2">
        <div
          className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 ${getBackgroundColor(message.senderName.charAt(0))}`}
        >
          {message.senderName.charAt(0).toUpperCase()}
        </div>
        <div className="relative ml-3 text-sm py-2 px-4 bg-gray-700 shadow rounded-xl">
          {messageFormat(message)}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={messageListRef}
      className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-800 px-4 pt-5 h-4/6 overflow-y-scroll"
    >
      {decryptedMessages.map(messageItem)}
    </section>
  );
};

export default MessageList;
