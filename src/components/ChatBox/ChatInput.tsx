import React, { useState } from 'react';
import './ChatInput.css'; // Create and import CSS for ChatInput
import { AiOutlineSend } from "react-icons/ai";


const ChatInput = () => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    // Logic to send the message will go here
    console.log(input);
    setInput('');
  };

  return (
    <div className="chat_section">
      <div className='chat_input'>
        <input
          className='chat_input_field'
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Aa"
        />
        <button className='send_button' onClick={handleSend}><AiOutlineSend/></button>
      </div>
    </div>
  );
};

export default ChatInput;
