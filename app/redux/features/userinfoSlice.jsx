import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from '../../../lib/utils';
import { RollerCoaster } from "lucide-react";

const initialState = {
  userProfile: {
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    is_email_verified: false,
    phone_number: "",
    is_phone_verified: false,
    address: "",
    profile_picture: "",
    created_at: "",
    updated_at: "",
    role:""
  },
};


// Fetch parent profile from backend


// Update parent profile (example)

const userinfoSlice = createSlice({
  name: "userinfo",
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    clearUserProfile: (state) => {
      state.userProfile = initialState.userProfile;
    },
  },
  extraReducers: (builder) => {
    builder
     
  },
});

export const { setUserProfile, clearUserProfile } = userinfoSlice.actions;
export default userinfoSlice.reducer;
