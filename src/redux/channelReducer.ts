import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";


interface channelState {
    channelList: string[],
    channel: string,
    mode: number,
    directUserName: string,
    directUserId: string,
}

const initialState: channelState = {
    channelList: ['general','important','random'],
    channel: 'general',
    mode: 2,
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
        }
    },
});

export const {setChannelDetail, addNewChannel, setReceiverDetail} = channelSlice.actions;
export const selectChannelName = (state:any) => state.channel.channel;
export const selectDirectUserName = (state:any) => state.channel.directUserName;
export const selectDirectUserId = (state:any) => state.channel.directUserId;
export const selectChatMode = (state:any) => state.channel.mode;
export const selectChannelList = (state:any) => state.channel.channelList;
export default channelSlice.reducer;