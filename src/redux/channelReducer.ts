import { createSlice } from "@reduxjs/toolkit";
import { off } from "process";
import { act } from "react-dom/test-utils";


interface channelState {
    channelList: any[],
    newChannelDetail: any,
    channel: string,
    mode: number,
    directUserName: string,
    directUserId: string,
}

const initialState: channelState = {
    channelList: [],
    newChannelDetail: null,
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
        setNewChannelDetail: (state, action) => {
            console.log("newChannelDetail", action.payload);
            if(action.payload === null){
                state.newChannelDetail = null;
            }
            else{
                let newChannelDetail = {} as any;
                newChannelDetail['channelName'] = action.payload['channelName'];
                newChannelDetail['channelId'] = action.payload['channelId'];
                newChannelDetail['channelType'] = action.payload['channelType'];
                newChannelDetail['channelMembers'] = action.payload['channelMembers'];
                state.newChannelDetail = newChannelDetail
            }
        },
    },
});

export const {setChannelDetail, addNewChannel, setReceiverDetail, setChannelHistory, setNewChannelDetail} = channelSlice.actions;
export const selectChannelName = (state:any) => state.channel.channel;
export const selectDirectUserName = (state:any) => state.channel.directUserName;
export const selectDirectUserId = (state:any) => state.channel.directUserId;
export const selectChatMode = (state:any) => state.channel.mode;
export const selectChannelList = (state:any) => state.channel.channelList;
export const selectNewChannelDetail = (state:any) => state.channel.newChannelDetail;
export default channelSlice.reducer;