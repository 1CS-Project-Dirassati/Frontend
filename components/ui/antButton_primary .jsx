"use client";
import { Button as AntDButton  } from 'antd';
export default function AntButton_primary({text,onClick,disabled }){
  const customButtonStyle = {
    display: "flex",
    width: "100%",
    padding: "2.1vw",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "var(--Interactive-border-radius---radius-i-sm, 12px)",
    border: "1px solid var(--Main-goten, #0771CB)",
   
    textAlign: "center", // Use camelCase for text-align
    fontFeatureSettings: "'clig' off, 'liga' off", // Use camelCase for font-feature-settings
    fontFamily: "DM Sans",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "24px",
    background:"#0771CB",
    color:"#F7FAFC",

  };
  
  return (
  
 <AntDButton onClick={onClick} size='large' block type="primary" style={customButtonStyle} disabled={disabled} >{text}</AntDButton>
  )
}

