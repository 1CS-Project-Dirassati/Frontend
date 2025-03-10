"use client";

import React, { useRef } from "react";
const OTP = ({ length = 6, onChange }) => {
  const inputs = Array.from({ length }, () => useRef());

  const handleChange = (index, value) => {
    onChange(index, value);
    if (value !== "" && index < length - 1) {
      inputs[index + 1].current.focus();
    }
  };

  const handleBackspace = (index, event) => {
    if (event.key === "Backspace" && index > 0 && !event.target.value) {
      inputs[index - 1].current.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",  
        marginTop: "20px",
        padding:"0"
      }}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          ref={inputs[index]}
          style={{
            width: "50px",
            height: "55px",
            textAlign: "center",
            fontSize: "18px",
            margin: "0 5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleBackspace(index, e)}
        />
      ))}
    </div>
  );
};

export default OTP;
