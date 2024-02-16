import React, { useState } from 'react';
// import './ChatInput.css'; // Create and import CSS for ChatInput

const ChatInput = () => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    // Logic to send the message will go here
    console.log(input);
    setInput('');
  };

  return (
    <div className="ChatInput">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInput;
