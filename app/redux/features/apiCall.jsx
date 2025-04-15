"use client";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchData = createAsyncThunk(
  'data/fetchData', // action type
  async ({ endpoint, method = 'GET', headers = {}, body = null, ...params }) => { // Accepts an object with the endpoint and other parameters
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Accessing the environment variable
    if (!apiUrl) {
      throw new Error('API URL is not defined in environment variables');
    }
    const url = `${apiUrl}${endpoint}`; 
    let response;

    if (method === 'POST') {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body), // Include body for POST requests
        ...params, // Spread additional parameters (e.g., timeout, etc.)
      });
      data = await response.json(); 
      if (response.ok){
        return data;
      }
    } else if (method === 'GET') {
      // GET requests shouldn't have a body
      const queryParams = new URLSearchParams(params).toString();
      const getUrl = queryParams ? `${url}?${queryParams}` : url;
      response = await fetch(getUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...headers },
        ...params, // Spread additional parameters
      });
      data = await response.json(); 
      if (response.ok){
        return data;
      }
    } else {
      throw new Error('Unsupported method'); // For unsupported HTTP methods
    }



// Return the data from the response
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    data: null,
    status: 'idle', // can be 'loading', 'succeeded', or 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default dataSlice.reducer;
