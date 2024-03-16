import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { persistor } from "../../../index";
import {
  selectChannelList,
  selectChannelName,
  setChannelDetail,
  setNewChannelAction,
} from "../../../redux/channelReducer";
import "./SideBar.css";
// import { useHistory } from 'react-router-dom';
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Checkbox } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { fetchDocsApi } from "../../../plugin/fetchApi";
import "quill/dist/quill.bubble.css";
import Sharedb from "sharedb/lib/client";
import richText from "rich-text";
import secureStorage from "react-secure-storage";
import {
  decryptMessage,
  encryptData,
  encryptMessage,
  generateAESKey,
} from "../../../helpers/cryptography";
import { useWebSocketContext } from "../../../hooks";
import { generateRandomAvatar, truncateString } from "../../../utils/helper";
import { UserInterface } from "../../../config/interface";

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

// Registering the rich text type to make sharedb work
// with our quill editor
Sharedb.types.register(richText.type);

// Connecting to our socket server
const socket = new WebSocket("ws://127.0.0.1:8080");
const connection = new Sharedb.Connection(socket);

const Sidebar: React.FC<Props> = () => {
  const { id, userid, mode } = useParams();
  const doc = connection.get("documents", id);
  const dispatch = useDispatch();
  const channels = useSelector(selectChannelList);
  const currentChannel = useSelector(selectChannelName);
  const [open, setOpen] = React.useState(false);
  const [openDocs, setOpenDocs] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const [newChannel, setNewChannel] = React.useState("");
  const [newDocs, setNewDocs] = React.useState("");
  const navigate = useNavigate();
  const users = useSelector((state: any) => state.users.users);
  const userName = useSelector((state: any) => state.login.username);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [newChannelUsers, setNewChannelUsers] = React.useState([] as any);
  const [documents, setDocuments] = useState<string[]>([]);

  const webSocketContext: any = useWebSocketContext();
  const { sendMessage } = webSocketContext;

  const handleSelectChannel = (selectedChannel: string) => {
    dispatch(setChannelDetail(selectedChannel));
  };

  const handleSelectUser = (user: UserInterface) => {
    navigate("/chat/direct/" + user.user_id)
  };

  const handleClose = () => {
    setOpen(false);
    setNewChannelUsers([]);
  };

  // @ts-ignore
  const encryptSymmetricKeyForUsers = async (key) => {
    let usersToEncryptFor = filterUsersByUserIDs(users, newChannelUsers);
    let encryptedKeys: any = [];
    for (const element of usersToEncryptFor) {
      encryptedKeys.push({
        userId: element.user_id,
        enryptedKey: await encryptData(key, element.public_key),
      });
    }

    return encryptedKeys;
  };

  function filterUsersByUserIDs(items: any, uuidsToFilterBy: any): any {
    // @ts-ignore
    return items.filter((item) => uuidsToFilterBy.includes(item.user_id));
  }

  const handleAddChannel = async () => {
    let newChannelDetail = {
      channelId: uuidv4(),
      channelName: newChannel,
      channelType: "private",
      channelMembers: newChannelUsers,
      channelAction: "add",
    };
    // Create a symmetric key, and send initial message
    // so when the user opens the message, can decrypt the key
    // with it's own SK, and then can decrypt it
    const generatedKey = await generateAESKey(); // Uncomment later the line below
    secureStorage.setItem(`ch_${newChannelDetail.channelId}`, generatedKey);
    // Send initial message
    const message = {
      messageId: uuidv4(),
      // senderId: userId,
      senderName: newChannelDetail.channelName,
      content: await encryptMessage("Tervetuloa!", generatedKey), // Encrypt the symmetric key with reciever's PK
      channel: newChannelDetail,
      keys: await encryptSymmetricKeyForUsers(generatedKey),
      chatMode: 2,
    };

    dispatch(setNewChannelAction(newChannelDetail));
    // await sendMessage(JSON.stringify(message));
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
    window.open(`/docs/${fileId}`, "_blank");
  };

  const handleCreateNewFile = () => {
    fetchDocsApi(`/docs/${newDocs}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => setOpenDocs(false));
  };

  const updateDocuments = (query: any) => {
    if (query.results) {
      setDocuments(query.results.map((item: any) => item.id));
    }
  };

  useEffect(() => {
    const query = connection.createSubscribeQuery("documents", {});

    query.on("ready", () => {
      updateDocuments(query);
    });

    query.on("changed", () => {
      updateDocuments(query);
    });
  }, []);

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
            {users.map((u: any) => (
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

      <aside className="sidebar bg-gray-700">
        <div className="flex flex-col items-center bg-gray-800 mt-1 w-full p-4 rounded-lg">
          <div
            className={`flex items-center justify-center h-16 w-16 bg-pink-200 rounded-full mb-2`}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          {userName}
        </div>

        <div className="direct-messages">
          <h2>Direct Message</h2>
          <div className="flex flex-col space-y-1 mt-4 -mx-2 overflow-y-auto">
            {users.map((user: any) => (
              <button
                onClick={() => handleSelectUser(user)}
                key={user.user_id}
                className={`flex flex-row items-center hover:bg-gray-100 hover:text-gray-800 rounded-xl p-2 ${userid === user.user_id && "bg-gray-100 text-gray-800"}`}
              >
                {generateRandomAvatar(user.username)}
                <div className="ml-2 text-sm font-semibold">
                  {truncateString(user.username, 18)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="channels">
          <h2 className="channels-header">
            <span>Channels</span>
            <button className="send_button" onClick={handleOpen}>
              <FaPlus />
            </button>
          </h2>
          {channels?.map((channel: any) => (
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
