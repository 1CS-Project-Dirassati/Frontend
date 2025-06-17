"use client";

import React, { useState } from "react";
import { Input } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

const Input_password = ({ inputValue, onInputChange }) => {
  const [input, setInput] = useState(inputValue || "");

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (typeof onInputChange === "function") {
      onInputChange(e.target.value);
    }
  };

  return (
    <Input.Password
      placeholder="password"
      style={{
        padding: 'clamp(10px, 12px, 14px)',
        maxHeight: '48px',
        width: '100%',
      }}
      iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
      value={input}
      onChange={handleInputChange}
      
      variant="filled"
    />
  );
};

export default Input_password;
