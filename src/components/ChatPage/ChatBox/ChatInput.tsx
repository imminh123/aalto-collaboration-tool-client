import React, { useCallback, useEffect, useState } from 'react';
import './ChatInput.css'; // Create and import CSS for ChatInput
import { AiOutlineSend } from "react-icons/ai";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages, setMessagesHistory } from '../../../redux/chatReducer';
import { v4 as uuidv4 } from 'uuid';
import { FileUploader } from "react-drag-drop-files";
import { get } from 'http';
import { setOnlineUsers } from '../../../redux/friendsReducer';
import { setChannelAfterDelete, setChannelHistory, setNewChannelAction } from '../../../redux/channelReducer';
import { useWebSocketContext } from '../../../hooks';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const userId = useSelector((state:any) => state.login.user_id);
  const userName = useSelector((state:any) => state.login.username);
  const chatMode = useSelector((state:any) => state.channel.mode);
  const channelName = useSelector((state:any) => state.channel.channel);
  const receiverName = useSelector((state:any) => state.channel.directUserName);
  const receiverId = useSelector((state:any) => state.channel.directUserId);
  const newChannelAction = useSelector((state:any) => state.channel.newChannelAction);

  // const socketUrl = `ws://localhost:8000/ws/${userId}`;
  const [file, setFile] = useState(null);
  const fileTypes = ["JPEG", "PNG", "GIF", "PDF"];
  const webSocketContext:any = useWebSocketContext();
  const { sendMessage, lastMessage, readyState, getWebSocket } = webSocketContext;
  
  const handleFile = (file:any) => {
    file[0].sender = userId;
    setFile(file);
  };


  const sendTextMessage = useCallback((userInput: string) => {
    if(file !== null){
      sendMessage(JSON.stringify({
        sender: userId,
        receiverId: receiverId,
        receiverName: receiverName,
        channel: channelName,
        fileName: (file[0] as any).name,
        messageType: 2, //MessageType 1 for sending text, 2 for sending file
        chatMode: 2,
      }));
      sendMessage(file[0]);
    }
    else{
      sendMessage(JSON.stringify({
        messageId: uuidv4(),
        senderId: userId,
        senderName: userName,
        content: userInput,
        channel: channelName,
        receiverName: receiverName,
        receiverId: receiverId,
        chatMode: chatMode,
        messageType: 1,  //MessageType 1 for sending text, 2 for sending file
      }))
    }
  }, [sendMessage,channelName, file, receiverName, receiverId, chatMode]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
      sendTextMessage(input);
      setInput('');
    }
  }

  const handleSendMessage = () => {
    sendTextMessage(input);
    setInput('');
  }

  const handleSendFile = () => {
      sendTextMessage("");
      setFile(null);
  }

  useEffect(() => {
    if(!!newChannelAction){
      if(newChannelAction.channelAction === 'add'){
        sendMessage(JSON.stringify({
          newChannel: newChannelAction,
          messageType: 4
        }) as any);
      }
      else if(newChannelAction.channelAction === 'delete'){
        sendMessage(JSON.stringify({
          deleteChannel: newChannelAction,
          messageType: 5
        }) as any);
      }
    }
    dispatch(setNewChannelAction(null));
  },[newChannelAction])

  useEffect(() => {
    if(!!lastMessage?.data && !!lastMessage && (lastMessage?.data instanceof ArrayBuffer || lastMessage?.data instanceof Blob)){
      const convertedPdfFile = new File([(lastMessage as any)?.data], "tmp.pdf", { type: "application/pdf" });
      let blob = new Blob([convertedPdfFile], { type: convertedPdfFile.type });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = convertedPdfFile.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setFile(null);
    }
    else if(typeof lastMessage?.data === 'string'){
      let messageObject = JSON.parse(lastMessage?.data);
      if (messageObject.loginType === 0){
        // loginType = 0: rerender online user list
        dispatch(setOnlineUsers(messageObject.onlineUserList))
      }
      else if (messageObject.loginType === 1)
      {
        // loginType = 1: load all messages history and channel history to new login user
        dispatch(setMessagesHistory(messageObject.messagesHistory))
        dispatch(setChannelHistory(messageObject.channelHistory))
      }
      // loginType = 2: load channel history to new login user
      else if (messageObject.loginType === 2){
        dispatch(setChannelHistory(messageObject.channelHistory))
      }
      else if(messageObject.loginType === 3){
        dispatch(setChannelAfterDelete(messageObject.deletedChannel));
      }
      else{
        dispatch(setMessages(lastMessage?.data));
      }
      
    }
  }, [lastMessage?.data]);



  return (
    <div className="chat_section">
      <div className='file_input'>
        <FileUploader
            multiple={true}
            handleChange={handleFile}
            name="file"
            types={fileTypes}
            className='file_input_field'
          />
          {file && <button className='send_button' 
          onClick={handleSendFile}
          >Up Load File</button>}
      </div>
      <div className='chat_input'>
        <input
          className='chat_input_field'
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Aa"
        />
        <button className='send_button' onClick={handleSendMessage}><AiOutlineSend/></button>
      </div>
    </div>
  );
};

export default ChatInput;
