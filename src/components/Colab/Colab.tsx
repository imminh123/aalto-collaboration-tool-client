import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useWebSocketContext } from '../../hooks';
import { useParams } from 'react-router-dom';

const Colab = () => {
    const [value, setValue] = React.useState('');
    const userId = useSelector((state:any) => state.login.user_id);
    let { id } = useParams()
    const socketUrl = `ws://localhost:8000/ws/${userId}`;
    const webSocketContext:any = useWebSocketContext();
    const { sendMessage, lastMessage, readyState, getWebSocket } = webSocketContext;

    const sendTextMessage = (userInput: string) => {
        sendMessage(JSON.stringify({
            senderId: userId,
            content: value || '',
            fileId: id,
            messageType: 3,
            chatMode: 3
        }));
    }

    useEffect(() => {
      if(!!lastMessage.data && typeof lastMessage.data === "string"){
        let lastMessageObject = JSON.parse(lastMessage.data);
        setValue(lastMessageObject.fileContent);
      }
    }, [lastMessage]);

    useEffect(() => {
      sendTextMessage(value);
    }, [value]);

    const handleOnChange = (content:any, delta:any, source:any, editor:any) => {
      setValue(content);
      const text = editor.getText();
      setValue(text);
    };

    return <ReactQuill theme="snow" value={value} onChange={handleOnChange} />;
}

export default Colab;