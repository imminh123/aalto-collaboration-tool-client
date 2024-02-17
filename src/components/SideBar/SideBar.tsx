import React from 'react';
import { IChannel } from '../../types';
import './SideBar.css';

interface Props {
    channels: IChannel[];
    currentChannelId: string;
    onChannelSelect: (channelId: string) => void;
}

const Sidebar: React.FC<Props> = ({ channels, currentChannelId, onChannelSelect }) => {
  return (
    <div className="sidebar">
      <div className='direct-messages'>
        <h2>Direct Message</h2>
      </div>
      <div className="channels">
        <h2>Channels</h2>
        {channels.filter(c => c.type === 'channel').map(channel => (
          <div 
            key={channel.id} 
            className={`channel-item ${channel.id === currentChannelId ? 'active' : ''}`}
            onClick={() => onChannelSelect(channel.id)}
          >
            # {channel.name}
          </div>
        ))}
      </div>
      <div className="direct-messages">
        <h2>Participants</h2>
        {channels.filter(c => c.type === 'direct_message').map(channel => (
          <div 
            key={channel.id} 
            className={`channel-item ${channel.id === currentChannelId ? 'active' : ''}`}
            onClick={() => onChannelSelect(channel.id)}
          >
            {channel.participants.join(', ')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
