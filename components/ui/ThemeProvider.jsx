"use client"; // Ensures it runs on the client side

import { ConfigProvider } from "antd";

export default function ThemeProvider({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: "#0771CB",
          // Alias Token
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
