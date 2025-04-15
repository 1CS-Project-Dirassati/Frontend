import { createSlice} from '@reduxjs/toolkit'
const initialState = {
  accessToken :null,
  refreshToken:null,  
 isAuthenticated:false,
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.accessToken= action.payload;
    
      state.isAuthenticated = true;
    },
    resetToken: (state) => {
      state.accessToken = null;
      state.refreshToken
      state.isAuthenticated = false;
    }
  },
  // Optional: if you need to handle rehydration specially
  extraReducers: (builder) => {
    builder.addCase('persist/REHYDRATE', (state, action) => {
      // Custom rehydration logic if needed
    });
  }
});
export const { setToken, resetToken } = authSlice.actions;
export default authSlice.reducer;