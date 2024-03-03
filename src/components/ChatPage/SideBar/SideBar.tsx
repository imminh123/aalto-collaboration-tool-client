import React from "react";
import { IChannel } from "../../../types";
import "./SideBar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  selectChannelList,
  setChannelDetail,
} from "../../../redux/channelReducer";
import {
  selectChannelName,
  addNewChannel,
  setNewChannelAction,
} from "../../../redux/channelReducer";
import { FaPlus } from "react-icons/fa";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { persistor } from "../../../index";
import { useNavigate } from "react-router-dom";
// import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { Button, Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDocs } from "../../../hooks/useDocs";
import { fetchApi, fetchDocsApi } from "../../../plugin/fetchApi";

interface Props {}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Sidebar: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannelList);
  const currentChannel = useSelector(selectChannelName);
  const [open, setOpen] = React.useState(false);
  const [openDocs, setOpenDocs] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const { documents } = useDocs();
  const [newChannel, setNewChannel] = React.useState("");
  const [newDocs, setNewDocs] = React.useState("");
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.users.users);
  const userName = useSelector((state: any) => state.login.username);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [newChannelUsers, setNewChannelUsers] = React.useState([] as any);

  const handleSelectChannel = (selectedChannel: string) => {
    dispatch(setChannelDetail(selectedChannel));
  };

  const handleClose = () => {
    setOpen(false);
    setNewChannelUsers([]);
  };

  const handleAddChannel = () => {
    let newChannelDetail = {
      channelId: uuidv4(),
      channelName: newChannel,
      channelType: "private",
      channelMembers: newChannelUsers,
      channelAction: "add",
    };
    dispatch(setNewChannelAction(newChannelDetail));
    handleClose();
  };

  const handleDeleteChannel = (channelId: string) => {
    let deleteChannelDetail = {
      channelId: channelId,
      channelAction: "delete",
    };
    dispatch(setNewChannelAction(deleteChannelDetail));
  };

  const handleCheckboxChange = (userId: string, isChecked: boolean) => {
    setNewChannelUsers((prev: any) => {
      if (isChecked) {
        return prev.includes(userId) ? prev : [...prev, userId];
      } else {
        return prev.filter((id: string) => id !== userId);
      }
    });
  };

  const handleLogout = async () => {
    const pr = await persistor.purge();
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  const handleOpenFile = (fileId: string) => {
    // console.log('open file');
    navigate(`/docs/${fileId}`);
  };

  const handleCreateNewFile =() => {
    fetchDocsApi(`/docs/${newDocs}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => setOpenDocs(false));
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <h2>New channel name</h2>
          <div className="add-channel-modal">
            <input
              className="add-channel-input"
              onChange={(e) => setNewChannel(e.target.value)}
            />
            <button onClick={handleAddChannel}>Add</button>
          </div>
          <div>
            {user.map((u: any) => (
              <div key={u.user_id}>
                <Checkbox
                  checked={newChannelUsers.includes(u.user_id)}
                  onChange={(e) =>
                    handleCheckboxChange(u.user_id, e.target.checked)
                  }
                  {...label}
                />
                {u.username}
              </div>
            ))}
          </div>
        </Box>
      </Modal>

      <Modal open={openDocs} onClose={() => setOpenDocs(false)}>
        <Box sx={style}>
          <h2>New collaborative file</h2>
          <div className="add-channel-modal">
            <input
              className="add-channel-input"
              onChange={(e) => setNewDocs(e.target.value)}
            />
            <button onClick={handleCreateNewFile}>Create</button>
          </div>
        </Box>
      </Modal>

      <aside className="sidebar">
        <div className="direct-messages">
          <h3> You are login as {userName}</h3>
        </div>
        <div className="direct-messages">
          <h2>Direct Message</h2>
        </div>
        <div className="channels">
          <h2 className="channels-header">
            Channels
            <button className="send_button" onClick={handleOpen}>
              <FaPlus />
            </button>
          </h2>
          {channels!.map((channel: any) => (
            <div
              key={channel.channelId}
              className={`channel-item ${channel === currentChannel ? "active" : ""}`}
              onClick={() => handleSelectChannel(channel)}
            >
              # {channel.channelName}
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteChannel(channel.channelId)}
              >
                Delete
              </Button>
            </div>
          ))}
          <h2 className="channels-header">
            File Channels
            <button className="send_button" onClick={() => setOpenDocs(true)}>
              <FaPlus />
            </button>
          </h2>
          {documents!.map((file: any) => (
            <div
              key={file}
              className="channel-item"
              onClick={() => handleOpenFile(file)}
            >
              {file}
            </div>
          ))}
        </div>
        <div className="logout">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
