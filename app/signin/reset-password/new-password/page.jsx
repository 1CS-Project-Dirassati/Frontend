"use client";
import style from "../../style.module.css"
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input_Password  from "@/components/ui/input_password";
import { useSelector } from "react-redux";
import { message } from "antd";
export default function ResetPassword(){
  const isVerifiedOTP = useSelector((state) => state.resetPassword.isVerifiedOTP);

  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [status,setStatus] = useState("");
  const[disabled, setDisabled] = useState(true);
 
  const handleChangePassword = (value) => {
    setPassword(value);
    setDisabled(value !== confirmationPassword);
  };
  const handleChangeConfirmationPassword = (value) => { 
    setConfirmationPassword(value);
    setDisabled(value !== Password);

  }

  const VerifyClickHandler =  (e) => {
 
    
  }



  if (!isVerifiedOTP){
    return <p> ERROR please try again!</p>;
  }
  else{
    return (
      <div className={style.container}>
        <div className={style.Form}>
          <h1 className={style.custom_text}>Reset Password</h1>
       
          <div className={style.InputContainer}>
            <p className={style.text}>New Password</p>
            <Input_Password  Status={status} inputValue={password} onInputChange={handleChangePassword}></Input_Password>
        </div>
        <div className={style.InputContainer}>
            <p className={style.text}>Confirm New Password</p>
            <Input_Password  Status={status} inputValue={password} onInputChange={handleChangeConfirmationPassword}></Input_Password>
        </div>
      
        <AntButton_primary  text={"Send Verification Email"} onClick={VerifyClickHandler} disabled={disabled}></AntButton_primary>
  
      </div>
      </div>
    )
  }

  
}
