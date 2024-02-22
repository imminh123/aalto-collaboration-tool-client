import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [] as any,
    },
    reducers: {
        setMessages: (state, action) => {
            if(typeof action.payload === 'string'){
                state.messages.push(JSON.parse(action.payload));
            }
        },
    },
});


export const selectMessages = (state:any) => state.chat.messages;
export const {setMessages} = chatSlice.actions;
export default chatSlice.reducer;