import React, { useState } from "react"
import Sidebar from "./SideBar/SideBar"
import OnlineUsersList from "./CurrentOnlineUsers/OnlineUsersList";
import ChatScreen from "./ChatScreen/ChatScreen";
import { IChannel } from "../../types";

const ChatPage = () => {

  return (
      <div className="App">
          <Sidebar/>
          <ChatScreen/>
          <OnlineUsersList />
      </div>
  )
}



export default ChatPage;