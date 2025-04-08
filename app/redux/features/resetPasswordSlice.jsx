import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isVerifiedOTP: false,
  email: "",
  otp:null
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
    setOtp:(state,action)=>{
      state.otp=action.payload;
    },
    setEmail : (state,action)=>{
      state.email=action.payload;
    }
  },
});
export const { verifyOTP, resetOTP,setEmail,setOtp } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;