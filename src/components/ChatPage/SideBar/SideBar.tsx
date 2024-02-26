import React from 'react';
import { IChannel } from '../../../types';
import './SideBar.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectChannelList, setChannelDetail } from '../../../redux/channelReducer';
import { selectChannelName, addNewChannel } from "../../../redux/channelReducer";
import { FaPlus } from "react-icons/fa";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { persistor } from '../../../index';
import { useNavigate } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
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
  const handleClose = () => setOpen(false);
  const [newChannel, setNewChannel] = React.useState('');
  const navigate = useNavigate();
  

  const handleSelectChannel = (selectedChannel:string) =>{
      dispatch(setChannelDetail(selectedChannel));
  }

  const handleAddChannel = () => {
    dispatch(addNewChannel(newChannel));
    handleClose();
  } 

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
              onChange={(e) => setNewChannel(e.target.value)}
            />
            <button onClick={handleAddChannel}>Add</button>
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
          {channels.map((channel:any)=> (
            <div 
              key={channel} 
              className={`channel-item ${channel === currentChannel ? 'active' : ''}`}
              onClick={() => handleSelectChannel(channel)}
            >
              # {channel}
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