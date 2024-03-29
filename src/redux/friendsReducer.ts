import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchAllUsers = createAsyncThunk(
    "user/listAll",
    async (_, thunkAPI) => {
      try {
        const response = await fetch("http://localhost:8001/users/");
  
        if (!response.ok) {
          // If the response is not 2xx, throw an error
          const errorData = await response.json();
          return thunkAPI.rejectWithValue(errorData);
        }
  
        const data = await response.json(); // Parse the response as JSON
        return data; // Return the response data
  
      } catch (error) {
        // If there's an error, return a rejected action with an error message
        return thunkAPI.rejectWithValue("Failed to fetch users");
      }
    }
  );

    export interface ListUserInitialState {
        users: [];
        onlineUsers: string[],
        offlineUsers: string[],
    }

    const initialState: ListUserInitialState = {
        users: [],
        onlineUsers: [],
        offlineUsers: [],
    }

    export const listUserSlice = createSlice({
        name: "users",
        initialState,
        reducers: {
            setUsers: (state, action: PayloadAction<any>) => {
                state.users = action.payload;
            },
            setOnlineUsers: (state, action) => {
              state.onlineUsers = state.users.filter((user:any) => action.payload.includes(user.user_id));
              state.offlineUsers = state.users.filter((user:any) => !action.payload.includes(user.user_id));
            }
        },
        extraReducers: (builder) => {
            builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.users = action.payload;
            });
        }
    });

    export const { setUsers, setOnlineUsers } = listUserSlice.actions;
    export const selectUsers = (state:any) => state.users.users;
    export const selectOnlineUsers = (state:any) => state.users.onlineUsers;
    export const selectOfflineUsers = (state:any) => state.users.offlineUsers;
    export default listUserSlice.reducer;