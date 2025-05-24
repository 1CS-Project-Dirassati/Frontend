import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from '../../../lib/utils';

const initialState = {
  parentProfile: {
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
  },
};


// Fetch parent profile from backend
export const fetchParentProfile = createAsyncThunk(
  'parentinfo/fetchParentProfile',
  async (parentId, thunkAPI) => {
    // The endpoint should match your backend route, e.g. /parents/<parent_id>
    return await callApi(`parents/${parentId}`);
  }
);

// Update parent profile (example)
export const updateParentProfile = createAsyncThunk(
  'parentinfo/updateParentProfile',
  async ({ parentId, profileData }, thunkAPI) => {
    // PATCH or PUT depending on your backend
    return await callApi(`parents/${parentId}`, 'PUT', profileData);
  }
);

const parentinfoSlice = createSlice({
  name: "parentinfo",
  initialState,
  reducers: {
    setParentProfile: (state, action) => {
      state.parentProfile = action.payload;
    },
    clearParentProfile: (state) => {
      state.parentProfile = initialState.parentProfile;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentProfile.fulfilled, (state, action) => {
        state.parentProfile = action.payload;
      })
      .addCase(updateParentProfile.fulfilled, (state, action) => {
        state.parentProfile = action.payload;
      });
  },
});

export const { setParentProfile, clearParentProfile } = parentinfoSlice.actions;
export default parentinfoSlice.reducer;
