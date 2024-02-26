import { createSlice } from "@reduxjs/toolkit";
import { off } from "process";
import { act } from "react-dom/test-utils";


interface channelState {
    channelList: any[],
    newChannelAction: any,
    channel: string,
    mode: number,
    directUserName: string,
    directUserId: string,
}

const initialState: channelState = {
    channelList: [],
    newChannelAction: null,
    channel: 'General',
    mode: 2, // 1 for direct message, 2 for channel, 3 for edit file, 4 for create new channel
    directUserName: '',
    directUserId: '',
}



export const channelSlice = createSlice({
    name: "channel",
    initialState,
    reducers: {
        setChannelDetail: (state, action) => {
            state.channel = action.payload;
            state.mode = 2;
        },
        addNewChannel: (state, action) => {
            state.channelList.push(action.payload);
        },
        setReceiverDetail: (state, action) => {
            state.directUserName = action.payload.username;
            state.directUserId = action.payload.user_id;
            state.mode = 1;
            state.channel = '';
        },
        setChannelHistory : (state, action) => {
            state.channel = action.payload[0];
            state.channelList = action.payload;
        },
        setNewChannelAction: (state, action) => {
            if(action.payload === null){
                state.newChannelAction = null;
            }
            else{
                let channelAction = action.payload['channelAction'];
                if(channelAction === 'add'){
                    let newChannelDetail = {} as any;
                    newChannelDetail['channelName'] = action.payload['channelName'];
                    newChannelDetail['channelId'] = action.payload['channelId'];
                    newChannelDetail['channelType'] = action.payload['channelType'];
                    newChannelDetail['channelMembers'] = action.payload['channelMembers'];
                    newChannelDetail['channelAction'] = action.payload['channelAction'];
                    state.newChannelAction = newChannelDetail
                }
                else if(channelAction === 'delete'){
                    let delChannelDetail = {} as any;
                    delChannelDetail['channelId'] = action.payload['channelId'];
                    delChannelDetail['channelAction'] = action.payload['channelAction'];
                    state.newChannelAction = delChannelDetail;
                }
            }
        },
        setChannelAfterDelete: (state, action) => {
            state.channelList = state.channelList.filter((channel) => channel.channelId !== action.payload);
            state.channel = state.channelList[0];
        }
    },
});

export const {setChannelDetail, addNewChannel, setReceiverDetail, setChannelHistory, setNewChannelAction, setChannelAfterDelete} = channelSlice.actions;
export const selectChannelName = (state:any) => state.channel.channel;
export const selectDirectUserName = (state:any) => state.channel.directUserName;
export const selectDirectUserId = (state:any) => state.channel.directUserId;
export const selectChatMode = (state:any) => state.channel.mode;
export const selectChannelList = (state:any) => state.channel.channelList;
export const selectNewChannelDetail = (state:any) => state.channel.newChannelDetail;
export default channelSlice.reducer;