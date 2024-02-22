// Part 1
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
  export const fetchUser = createAsyncThunk(
      "user/login",
      async ({ username, password }: { username: string, password: string }, thunkAPI) => {
        try {
          const response = await fetch("http://localhost:8001/login/", { // Ensure you use 'http://' or 'https://' in your URL.
            method: 'POST', // Set the method to POST
            headers: {
              'Content-Type': 'application/json', // Set the content type header
              // Add any other relevant headers here, like authorization tokens.
            },
            body: JSON.stringify({ // Stringify your payload and pass it as the body
              username: username,
              password: password,
            }),
          });
    
          if (!response.ok) {
            // If the response is not 2xx, throw an error
            const errorData = await response.json();
            return thunkAPI.rejectWithValue(errorData);
          }
    
          const data = await response.json(); // Parse the response as JSON
          return data; // Return the response data
    
        } catch (error) {
          // If there's an error, return a rejected action with an error message
          return thunkAPI.rejectWithValue("Failed to fetch user");
        }
      }
    );

   
    

  export const register = createAsyncThunk(
  "user/register",
  async ({ username, password }: { username: string, password: string }, thunkAPI) => {
      try {
      const response = await fetch("http://localhost:8001/register/", { // Ensure you use 'http://' or 'https://' in your URL.
          method: 'POST', // Set the method to POST
          headers: {
          'Content-Type': 'application/json', // Set the content type header
          // Add any other relevant headers here, like authorization tokens.
          },
          body: JSON.stringify({ // Stringify your payload and pass it as the body
          username: username,
          password: password,
          }),
      });

      if (!response.ok) {
          // If the response is not 2xx, throw an error
          const errorData = await response.json();
          return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json(); // Parse the response as JSON
  
      return data; // Return the response data

      } catch (error) {
      // If there's an error, return a rejected action with an error message
      return thunkAPI.rejectWithValue("Failed to fetch user");
      }
  }
  );

interface UserInitialState {
    username: string,
    user_id: string
}
const initialState: UserInitialState = {
    username: '',
    user_id: ''
}

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchUser.fulfilled, (state, action) => {
            state.username = action.payload.username;
            state.user_id = action.payload.user_id;
          })
          .addCase(fetchUser.rejected, (state, action) => {
          })
          .addCase(register.fulfilled, (state, action) => {
            state.username = action.payload.username;
            state.user_id = action.payload.user_id;
          })
          .addCase(register.rejected, (state, action) => {
          });
      },
})


export const selectUserId = (state: any) => state.login.user_id;
export default loginSlice.reducer
