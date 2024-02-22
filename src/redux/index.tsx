import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import authReducer from "./authReducer";
import friendsReducer from "./friendsReducer";
import channelReducer from "./channelReducer";
import chatReducer from "./chatReducer";


export const store = configureStore({
    reducer: {
        login: authReducer,
        users: friendsReducer,
        channel: channelReducer,
        chat: chatReducer
    },
    // devTools: process.env.NODE_ENV !== 'production',
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
