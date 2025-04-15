import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`, // Replace with your real base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Generic API Call function
const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const response = await API({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`API call error: ${error}`);
    throw error; // Let the component handle it
  }
};

export default apiCall;
