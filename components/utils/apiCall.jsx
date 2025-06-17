'use client';

import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    
  },
});

// Generic API Call function
const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const { token, headers: customHeaders = {}, ...restConfig } = config;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    };

 
    const response = await API({
      method,
      url,
      data,
      headers,
      ...restConfig,
    });

    return response.data;
  } catch (error) {
  
    throw error;
  }
};

export default apiCall;
