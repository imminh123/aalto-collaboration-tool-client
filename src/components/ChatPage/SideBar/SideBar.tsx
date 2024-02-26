import React from 'react';
import { IChannel } from '../../../types';
import './SideBar.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectChannelList, setChannelDetail } from '../../../redux/channelReducer';
import { selectChannelName, addNewChannel, setNewChannelDetail } from "../../../redux/channelReducer";
import { FaPlus } from "react-icons/fa";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { persistor } from '../../../index';
import { useNavigate } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from '@mui/material';

interface Props {
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Sidebar: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannelList);
  const currentChannel = useSelector(selectChannelName);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  
  const [newChannel, setNewChannel] = React.useState('');
  const navigate = useNavigate();
  const user = useSelector((state:any) => state.users.users);
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const [newChannelUsers, setNewChannelUsers] = React.useState([] as any);

  const handleSelectChannel = (selectedChannel:string) =>{
      dispatch(setChannelDetail(selectedChannel));
  }

  const handleClose = () => {
    setOpen(false);
    setNewChannelUsers([]);
  }

  const handleAddChannel = () => {
    console.log('newChannel', newChannelUsers);
    let newChannelDetail = {
      "channelId": uuidv4(),
      "channelName": newChannel,
      "channelType": "private",
      "channelMembers": newChannelUsers,
    }
    dispatch(setNewChannelDetail(newChannelDetail));
    handleClose();
  } 

  const handleCheckboxChange = (userId:string, isChecked:boolean) => {
    setNewChannelUsers((prev:any) => {
      if (isChecked) {
        return prev.includes(userId) ? prev : [...prev, userId];
      } else {
        return prev.filter((id:string) => id !== userId);
      }
    });
  };

  const handleLogout = async () => {
    const pr = await persistor.purge()
    setTimeout(() => {
      navigate('/login');
    }, 100);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
      >        
        <Box sx={style}>
          <h2>New channel name</h2>
          <div className='add-channel-modal'>
            <input
              className='add-channel-input'
              onChange={(e) => setNewChannel(e.target.value)}
            />
            <button onClick={handleAddChannel}>Add</button>
          </div>
          <div>
              {
                user.map((u:any) => (
                  <div key={u.user_id}>
                    <Checkbox 
                      checked={newChannelUsers.includes(u.user_id)}
                      onChange={(e) => handleCheckboxChange(u.user_id, e.target.checked)}
                      {...label} 
                    />
                    {u.username}
                  </div>
                ))
              }
            </div>
        </Box>
      </Modal>
      <div className="sidebar">
        <div className='direct-messages'>
          <h2>Direct Message
          </h2>
        </div>
        <div className="channels">
          <h2 className='channels-header'>
            Channels
            <button className='send_button' 
              onClick={handleOpen}
            >
              <FaPlus/>
            </button>
          </h2>
          {channels && channels.map((channel:any)=> (
            <div 
              key={channel.channelId} 
              className={`channel-item ${channel === currentChannel ? 'active' : ''}`}
              onClick={() => handleSelectChannel(channel)}
            >
              # {channel.channelName}
            </div>
          ))}
        </div>
        <div className='logout'>
          <button
            onClick={handleLogout}
          >Logout</button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;