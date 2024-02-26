import React, { useCallback, useEffect, useState } from 'react';
import './ChatInput.css'; // Create and import CSS for ChatInput
import { AiOutlineSend } from "react-icons/ai";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages } from '../../../redux/chatReducer';
import { v4 as uuidv4 } from 'uuid';
import { FileUploader } from "react-drag-drop-files";
import { get } from 'http';
import { setOnlineUsers } from '../../../redux/channelReducer';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const userId = useSelector((state:any) => state.login.user_id);
  const userName = useSelector((state:any) => state.login.username);
  const chatMode = useSelector((state:any) => state.channel.mode);
  const channelName = useSelector((state:any) => state.channel.channel);
  const receiverName = useSelector((state:any) => state.channel.directUserName);
  const receiverId = useSelector((state:any) => state.channel.directUserId);
  const socketUrl = `ws://localhost:8000/ws/${userId}`;
  const [file, setFile] = useState(null);
  const fileTypes = ["JPEG", "PNG", "GIF", "PDF"];
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
  });
  
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
        messageType: 2,
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
        messageType: 1,      
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
    console.log("ON", lastMessage?.data);
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
      if (messageObject.messageType === 0){
        dispatch(setOnlineUsers(messageObject.data))
      }
      dispatch(setMessages(lastMessage?.data));
    }
  }, [lastMessage?.data]);



  return (
    <div className="chat_section">
      <div>
        <FileUploader
            multiple={true}
            handleChange={handleFile}
            name="file"
            types={fileTypes}
          />
          <button className='send_button' 
          onClick={handleSendFile}
          ><AiOutlineSend/></button>
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
