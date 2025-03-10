import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isVerifiedOTP: false,
  email: "",
}
const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState,
  reducers: {
    verifyOTP: (state) => {
      state.isVerifiedOTP = true;
    },
    resetOTP: (state) => {
      state.isVerifiedOTP = false;
    },
    setEmail : (state,action)=>{
      state.email=action.payload;
    }
  },
});
export const { verifyOTP, resetOTP,setEmail } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;