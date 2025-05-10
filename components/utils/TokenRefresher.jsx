"use client";
import apiCall from "./apiCall";
import { setToken } from "@/app/redux/features/auth/authSlice";
import { useSelector,useDispatch } from "react-redux";
import {  useEffect } from "react";
export default function TokenRefresher() {
  const Token = useSelector((state) => state.auth.refreshToken);
  const dispatch = useDispatch();
  useEffect(() => {
    const refreshToken = async () => {
      
      if (!Token) return;

      try {
        const response = await apiCall('POST', '/auth/refresh-token', { "refresh-token": Token });
        if (response[1]===200){
          dispatch(setToken(response[1]));
        }
     
       
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        
      }
    };

    if (Token) {
      console.log(Token)
      refreshToken(); // Initial call when the app starts

      const interval = setInterval(refreshToken,15*1000* 60 ); // Refresh every 15 min

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, []);
  return null;
}