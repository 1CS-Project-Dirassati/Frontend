import { configureStore } from "@reduxjs/toolkit";
import resetPasswordReducer from "./features/resetPasswordSlice"; 

export const store = configureStore({
  reducer: {
    resetPassword: resetPasswordReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});