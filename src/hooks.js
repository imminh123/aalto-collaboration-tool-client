import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useWebSocket from 'react-use-websocket';

const WebSocketContext = createContext(null);


export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {

  const userId = useSelector((state) => state.login.user_id);
  const socketUrl = `ws://localhost:8000/ws/${userId}`;
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    socketUrl, 
    {
      shouldReconnect: (closeEvent) => true,
      share: true,
    },
  );

  const value = useMemo(() => ({ sendMessage, lastMessage, readyState, getWebSocket }), [sendMessage, lastMessage, readyState, getWebSocket]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
