import { createSlice} from '@reduxjs/toolkit'
const initialState = {
 token:null,
 isAuthenticated:false,
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    resetToken: (state) => {
      state.token = null;
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