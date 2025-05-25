import { createSlice} from '@reduxjs/toolkit'
const initialState = {
  accessToken:null,
  refreshToken:null,  
  isAuthenticated:false,
  role:null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      console.log("amhere ",action.payload)
      state.accessToken= action.payload.accessToken;
      state.refreshToken=action.payload.refreshToken;
      state.role=action.payload.role;
      state.isAuthenticated = true;
    },
    resetToken: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
    },
      updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
  },
  // Optional: if you need to handle rehydration specially
  extraReducers: (builder) => {
    builder.addCase('persist/REHYDRATE', (state, action) => {
      // Custom rehydration logic if needed
    });
  }
});
export const { setToken, resetToken, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;