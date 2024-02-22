import React, { useCallback, useEffect, useState } from 'react';
import './ChatInput.css'; // Create and import CSS for ChatInput
import { AiOutlineSend } from "react-icons/ai";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages } from '../../../redux/chatReducer';
import { v4 as uuidv4 } from 'uuid';


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
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
  });

  const sendTestMessage = useCallback((userInput: string) => {
    sendMessage(JSON.stringify({
      messageId: uuidv4(),
      senderId: userId,
      senderName: userName,
      content: userInput,
      channel: channelName,
      receiverName: receiverName,
      receiverId: receiverId,
      chatMode: chatMode
    }));
  }, [sendMessage,channelName]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
      sendTestMessage(input);
      setInput('');
    }
  }

  const handleSendMessage = () => {
      sendTestMessage(input);
      setInput('');
  }

  useEffect(() => {
    dispatch(setMessages(lastMessage?.data));
  }, [lastMessage?.data]);


  return (
    <div className="chat_section">
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
