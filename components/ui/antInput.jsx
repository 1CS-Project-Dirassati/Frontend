"use client";
import React, { useState } from 'react';
import { Input } from 'antd';



export default function InputFields({ placeHolder, inputValue, onInputChange, Status })  {
  const [input, setInput] = useState(inputValue || '');
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (typeof onInputChange === 'function') {
      onInputChange(e.target.value);
    }
  };

  return (
    <Input
    placeholder={placeHolder}
    value={input}
    onChange={handleInputChange}
    status={Status}
    style={{
      padding: 'clamp(10px, 12px, 14px)',
      maxHeight: '48px',
      width: '100%',
    }}
    
    variant="filled"
  />
  
  );
};

