"use client";
import apiCall from "./apiCall";
import { setToken } from "@/app/redux/features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
export default function TokenRefresher() {
  const refreshTokenValue = useSelector((state) => state.auth.refreshToken);  
  const access_token  = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();


function getTimeUntilTwoMinutesBeforeExpiry(token) {
  try {
    const decoded = jwtDecode(token);
    const expiryTimeMs = decoded.exp * 1000;
    const twoMinutesMs = 2 * 60 * 1000;
    const currentTimeMs = Date.now();
    return expiryTimeMs - currentTimeMs - twoMinutesMs;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

  useEffect(() => {

    if (!refreshTokenValue) return;

    const refreshToken = async () => {
      try {
        const response = await apiCall('POST', '/auth/refresh',null, {
          token: refreshTokenValue,
        });

        if (response.status  && response?.access_token) {
          console.log(response.access_token)
           dispatch(setToken({
        accessToken: response.access_token,
      // default role if missing
      }));
        }
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
      }
    };

    refreshToken(); // Initial call
    const interval = setInterval(refreshToken, 13 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval); // Clean up
  }, [refreshTokenValue]);

  return null;
}
