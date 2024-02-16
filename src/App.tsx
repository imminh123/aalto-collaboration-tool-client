import React, { useState } from 'react';
import Sidebar from './components/SideBar/SideBar';
import ChatScreen from './components/ChatScreen/ChatScreen';
import { IChannel } from './types';
import './App.css';
import OnlineUsersList from './components/CurrentOnlineUsers/OnlineUsersList';

const initialChannels: IChannel[] = [
  {
    id: 'channel1',
    name: 'general',
    type: 'channel',
    participants: ['User1', 'User2', 'User3'],
    messages: [
      {
        id: 'msg1',
        content: 'Welcome to the general channel!',
        sender: 'User1',
        timestamp: new Date(),
      },
      // ... more messages
    ],
  },
  {
    id: 'channel2',
    name: 'random',
    type: 'channel',
    participants: ['User1', 'User2'],
    messages: [
      {
        id: 'msg2',
        content: 'This is a random channel.',
        sender: 'User2',
        timestamp: new Date(),
      },
      // ... more messages
    ],
  },
  {
    id: 'dm1',
    name: 'User1 & User3',
    type: 'direct_message',
    participants: ['User1', 'User3'],
    messages: [
      {
        id: 'msg3',
        content: 'Hey, how are you?',
        sender: 'User1',
        timestamp: new Date(),
      },
      // ... more messages
    ],
  },
  // ... more channels and direct messages
];


const App: React.FC = () => {
  const [channels, setChannels] = useState<IChannel[]>(initialChannels);
  const [currentChannelId, setCurrentChannelId] = useState<string>(channels[0].id);

  const handleChannelSelect = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  const currentChannel = channels.find(channel => channel.id === currentChannelId);

  return (
    <div className="App">
      <Sidebar 
        channels={channels} 
        currentChannelId={currentChannelId} 
        onChannelSelect={handleChannelSelect}
      />
      {currentChannel && <ChatScreen channel={currentChannel} />}
      <OnlineUsersList />
    </div>
  );
};

export default App;
