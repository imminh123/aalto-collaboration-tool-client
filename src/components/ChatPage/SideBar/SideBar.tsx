import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import React, { Fragment, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
import "quill/dist/quill.bubble.css";
import richText from "rich-text";
import Sharedb from "sharedb/lib/client";
import { v4 as uuidv4 } from "uuid";
import { fetchDocsApi } from "../../../plugin/fetchApi";
// import secureStorage from "react-secure-storage";
import { Dialog, Transition } from "@headlessui/react";
import { UserInterface } from "../../../config/interface";
import {
  encryptData,
  generateAESKey
} from "../../../helpers/cryptography";
import {
  generateRandomAvatar,
  secureStorage,
  truncateString,
} from "../../../utils/helper";

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
  const user_id = useSelector((state: any) => state.login.user_id);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [newChannelUsers, setNewChannelUsers] = React.useState([] as any);
  const [documents, setDocuments] = useState<string[]>([]);

  const handleSelectChannel = (selectedChannel) => {
    navigate("/chat/2/" + selectedChannel.channelId);
    dispatch(setChannelDetail(selectedChannel));
  };

  const handleSelectUser = (user: UserInterface) => {
    navigate("/chat/1/" + user.user_id);
  };

  const handleClose = () => {
    setOpen(false);
    setNewChannelUsers([]);
  };

  // @ts-ignore
  const encryptSymmetricKeyForUsers = async (key) => {
    let usersToEncryptFor = filterUsersByUserIDs(users, newChannelUsers);
    let encryptedKeys: any = [];
    for (const user of usersToEncryptFor) {
      encryptedKeys.push({
        userId: user.user_id,
        enryptedKey: await encryptData(key, user.public_key),
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
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Create new channel
                  </Dialog.Title>

                  <Dialog.Description>
                    <div className="flex mt-3">
                      <input
                        type="text"
                        className="flex w-4/5 border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10 text-gray-900"
                        onChange={(e) => setNewChannel(e.target.value)}
                      />
                      <button
                        onClick={handleAddChannel}
                        className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white px-4 py-1 flex-shrink-0 ml-2"
                      >
                        <span>Create</span>
                      </button>
                    </div>

                    <div>
                      <p className="font-semibold mt-3">Members</p>
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
                  </Dialog.Description>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
            {users
              .filter((user) => user.user_id !== user_id)
              .map((user: any) => (
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
