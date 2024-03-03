import useWebSocket, { ReadyState } from "react-use-websocket";

export const useSocket = () => {
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    "",
    {
      shouldReconnect: (closeEvent) => true,
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return { connectionStatus };
};
