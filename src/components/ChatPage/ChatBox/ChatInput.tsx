import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ChatInput.css"; // Create and import CSS for ChatInput
import { AiOutlineSend } from "react-icons/ai";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, setMessagesHistory } from "../../../redux/chatReducer";
// import secureStorage from "react-secure-storage";
import {
  decryptMessage,
  encryptData,
  encryptMessage,
  generateAESKey,
} from "../../../helpers/cryptography";
import { v4 as uuidv4 } from "uuid";
import { FileUploader } from "react-drag-drop-files";
import { get } from "http";
import { setOnlineUsers } from "../../../redux/friendsReducer";
import {
  setChannelAfterDelete,
  setChannelHistory,
  setNewChannelAction,
} from "../../../redux/channelReducer";
import { useWebSocketContext } from "../../../hooks";
import { CHAT_MODE } from "../../../config/constant";
import { useParams } from "react-router-dom";
import { fetchApi } from "../../../plugin/fetchApi";
import { UserInterface } from "../../../config/interface";
import { secureStorage } from "../../../utils/helper";

const ChatInput = () => {
  const [input, setInput] = useState("");
  const [receiverUser, setReceiverUser] = useState<UserInterface>();
  const { mode, userid: receiverId } = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state: any) => state.login.user_id);
  const users = useSelector((state: any) => state.users.users);
  const userName = useSelector((state: any) => state.login.username);
  const chatMode = useSelector((state: any) => state.channel.mode);
  const channel = useSelector((state: any) => state.channel.channel);
  const receiverName = useSelector(
    (state: any) => state.channel.directUserName
  );
  // const receiverId = useSelector((state: any) => state.channel.directUserId);
  const receiverPK = useSelector((state: any) => state.channel.directUserPK);
  const newChannelAction = useSelector(
    (state: any) => state.channel.newChannelAction
  );
  const fileInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState(null);
  const fileTypes = ["JPEG", "PNG", "GIF", "PDF"];
  const webSocketContext: any = useWebSocketContext();
  const { sendMessage, lastMessage, readyState, getWebSocket } =
    webSocketContext;

  const handleFile = async () => {
    if (fileInput?.current?.files) {
      const file = fileInput?.current?.files[0]; // Assuming only one file is dropped
      const formData = new FormData();

      formData.append("file", file);

      try {
        await fetch(`http://localhost:8000/upload-file`, {
          method: "POST",
          body: formData,
        });
        const now = new Date();
        const symmetricKey: any = secureStorage.getItem(
          `dm_${userId}:${receiverId}`
        ) as string;
      

        sendMessage(
          JSON.stringify({
            // senderId: userId,
            // senderName: userName,
            // receiverId: receiverId,
            // receiverName: receiverUser?.username,
            // channel: channel,
            // fileName: (file as any).name,
            // messageType: 1, //MessageType 1 for sending text, 2 for sending file
            // chatMode: 1,
            content: await encryptMessage((file as any).name, symmetricKey),
            messageId: uuidv4(),
            senderId: userId,
            senderName: userName,
            isFile: true,
            channel: channel,
            timestamp: Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds()
            ),
            receiverName: receiverName,
            receiverId: receiverId,
            chatMode: chatMode,
            messageType: 1, // MessageType 1 for sending text, 2 for sending file
          })
        );
      } catch (error) {
        console.error("An error occurred while uploading the file:", error);
      }
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const user = await fetchApi(`/users/${receiverId}`, {
        method: "GET",
      });
      setReceiverUser(user);
    };

    if (receiverId) {
      getUser();
    }
  }, [receiverId]);

  useEffect(() => {
  }, [receiverUser]);

  const sendTextMessage = useCallback(
    async (userInput: string) => {
      if (file !== null) {
        // console.log("🚀 ~ file:", file)
        // sendMessage(
        //   JSON.stringify({
        //     sender: userId,
        //     receiverId: receiverId,
        //     receiverName: receiverUser?.username,
        //     channel: channel,
        //     fileName: (file[0] as any).name,
        //     messageType: 2, //MessageType 1 for sending text, 2 for sending file
        //     chatMode: 2,
        //   })
        // );
        // sendMessage(file[0]);
      } else {
        const now = new Date();
        if (chatMode === CHAT_MODE.DIRECT) {
          // This is for DirectMessages
          // It would be quite similar with channels as well
          let keyExists = false;
          if (!secureStorage.getItem(`dm_${userId}:${receiverId}`)) {
            // Generate key and send in the message encrypted
            secureStorage.setItem(
              `dm_${userId}:${receiverId}`,
              await generateAESKey()
            );
          } else {
            keyExists = true;
          }

          const symmetricKey: any = secureStorage.getItem(
            `dm_${userId}:${receiverId}`
          ) as string;
          let message = {
            messageId: uuidv4(),
            senderId: userId,
            senderName: userName,
            content: await encryptMessage(userInput, symmetricKey), // Encrypt the symmetric key with reciever's PK
            channel: channel,
            timestamp: Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds()
            ),
            receiverName: receiverName,
            receiverId: receiverId,
            chatMode: chatMode,
            messageType: 1, // MessageType 1 for sending text, 2 for sending file
          };
          if (!keyExists) {
            // @ts-ignore
            message.aesKey = await encryptData(symmetricKey, receiverPK);
          }
          sendMessage(JSON.stringify(message));
        } else if (chatMode === CHAT_MODE.CHANNEL) {
          // The key will be always existent
          // because a message will be generated by the channel
          // which is going to be always loaded before getting the
          // chance to send something
          const symmetricKey: any = secureStorage.getItem(
            `ch_${channel.channelId}`
          ) as string;
          let message = {
            messageId: uuidv4(),
            senderId: userId,
            senderName: userName,
            content: await encryptMessage(userInput, symmetricKey), // Encrypt the symmetric key with reciever's PK
            channel: channel.channelId,
            timestamp: Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds()
            ),
            chatMode: chatMode,
            messageType: 1, // MessageType 1 for sending text, 2 for sending file
          };
          sendMessage(JSON.stringify(message));

          // let keyExists = false;
          // if(!secureStorage.getItem(`${channelName}_key`)) {
          //   // Decrypt the channel key from the appropriate message
          //   // secureStorage.setItem(`dm_${userId}:${receiverId}`, await generateAESKey());
          // } else {
          //   keyExists = true;
          // }
        }
      }
    },
    [sendMessage, channel, file, receiverName, receiverId, chatMode]
  );

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendTextMessage(input);
      setInput("");
    }
  };

  const handleSendMessage = async () => {
    sendTextMessage(input);
    setInput("");
  };

  const handleSendFile = () => {
    sendTextMessage("");
    setFile(null);
  };

  function filterUsersByUserIDs(items: any, uuidsToFilterBy: any): any {
    // @ts-ignore
    return items.filter((item) => uuidsToFilterBy.includes(item.user_id));
  }

  // @ts-ignore
  const encryptSymmetricKeysAndWelcomMessageForUsers = async (
    allUsers,
    newChannelDetail,
    key
  ) => {
    let usersToEncryptFor = filterUsersByUserIDs(
      allUsers,
      newChannelDetail.channelMembers
    );
    // console.log(usersToEncryptFor);
    let encryptedKeys: any = [];
    for (const user of usersToEncryptFor) {
      encryptedKeys.push({
        userId: user.user_id,
        enryptedKey: await encryptData(key, user.public_key),
      });
    }
    // console.log(secureStorage.getItem(`ch_${newChannelDetail.channelId}`) as string);
    const message = {
      messageId: uuidv4(),
      senderId: newChannelAction.channelId,
      senderName: newChannelAction.channelName,
      content: await encryptMessage(
        "Tervetuloa!",
        secureStorage.getItem(`ch_${newChannelDetail.channelId}`) as string
      ), // Encrypt the symmetric key with reciever's PK
      channel: newChannelDetail.channelId,
      keys: encryptedKeys,
      // receiverName: receiverName,
      // receiverId: receiverId,
      chatMode: 2,
      messageType: 1, // MessageType 1 for sending text, 2 for sending file
    };
    return message;
  };

  useEffect(() => {
    if (!!newChannelAction) {
      if (newChannelAction.channelAction === "add") {
        sendMessage(
          JSON.stringify({
            newChannel: newChannelAction,
            messageType: 4,
          }) as any
        );

        // sendMessage()
        encryptSymmetricKeysAndWelcomMessageForUsers(
          users,
          newChannelAction,
          secureStorage.getItem(`ch_${newChannelAction.channelId}`) as string
        ).then((data) => {
          console.log(data);
          sendMessage(JSON.stringify(data));
        });
        console.log("This is the channel: " + JSON.stringify(newChannelAction));
      } else if (newChannelAction.channelAction === "delete") {
        sendMessage(
          JSON.stringify({
            deleteChannel: newChannelAction,
            messageType: 5,
          }) as any
        );
      }
    }
    dispatch(setNewChannelAction(null));
  }, [newChannelAction]);

  useEffect(() => {
    if (
      !!lastMessage?.data &&
      !!lastMessage &&
      (lastMessage?.data instanceof ArrayBuffer ||
        lastMessage?.data instanceof Blob)
    ) {
      const convertedPdfFile = new File(
        [(lastMessage as any)?.data],
        "tmp.pdf",
        { type: "application/pdf" }
      );
      let blob = new Blob([convertedPdfFile], { type: convertedPdfFile.type });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = convertedPdfFile.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setFile(null);
    } else if (typeof lastMessage?.data === "string") {
      let messageObject = JSON.parse(lastMessage?.data);
      if (messageObject.loginType === 0) {
        // loginType = 0: rerender online user list
        dispatch(setOnlineUsers(messageObject.onlineUserList));
      } else if (messageObject.loginType === CHAT_MODE.DIRECT) {
        // loginType = 1: load all messages history and channel history to new login user
        dispatch(setMessagesHistory(messageObject.messagesHistory));
        dispatch(setChannelHistory(messageObject.channelHistory));
      }
      // loginType = 2: load channel history to new login user
      else if (messageObject.loginType === CHAT_MODE.CHANNEL) {
        dispatch(setChannelHistory(messageObject.channelHistory));
      } else if (messageObject.loginType === 3) {
        dispatch(setChannelAfterDelete(messageObject.deletedChannel));
      } else {
        dispatch(setMessages(lastMessage?.data));
      }
    }
  }, [lastMessage?.data]);

  const handleSelectFile = () => {
    fileInput.current?.click();
  };
  return (
    <div className="chat_section">
      <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
        <button
          className="flex items-center justify-center text-gray-400 hover:text-gray-600"
          onClick={handleSelectFile}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            ></path>
          </svg>
          <input
            type="file"
            ref={fileInput}
            id="fileUpload"
            name="fileUpload"
            onChange={handleFile}
            style={{ display: "none" }}
            accept=".jpg, .jpeg, .png, .gif, .pdf, .txt"
          />
        </button>
        <div className="flex-grow ml-4">
          <div className="relative w-full">
            <input
              type="text"
              className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10 text-gray-900"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleEnter}
            />
          </div>
        </div>

        <div className="ml-4">
          <button
            onClick={handleSendMessage}
            className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
          >
            <span>Send</span>
            <span className="ml-2">
              <svg
                className="w-4 h-4 transform rotate-45 -mt-px"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
