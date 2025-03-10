"use client";
import style from "../../style.module.css"
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import { useState } from "react";
import OTP from "@/components/ui/OTPInput";
import {  useDispatch } from "react-redux";
import { verifyOTP,resetOTP } from "../../../redux/features/resetPasswordSlice";
import { useRouter } from "next/navigation";

export default function emailVerification() {
  const router = useRouter();
  const [otp, setOTP] = useState('');
  const [status, setStatus] = useState("");
  const dispatch = useDispatch();

  const handleOTPChange = (index, value) => {
    const newOTP = otp.slice(0, index) + value + otp.slice(index + 1);
    setOTP(newOTP);
  };

  const VerifyClickHandler =  (e) => {
     if(otp==="12345"){
      dispatch(verifyOTP());
      router.push("/signin/reset-password/new-password")
      setStatus(null)
     }
     else{
      dispatch(resetOTP());
       setStatus("error")
     }
     

    console.log("Verify clicked")
  }





  return (
    <div className={style.container}>
      <div className={style.Form}>
        <h1 className={style.custom_text}>Reset Password</h1>
     
        <div className={style.InputContainer}>
          <p className={style.text}>Enter the verification code sent to your Email to reset your Password. </p>
       </div>
        <div className={style.InputContainer}>                      
             <OTP length={5} onChange={handleOTPChange} />
             {status === "error" ? (
                  <p className={style.Error_message} style={{marginTop:"-8px",marginLeft:"5px"}}>Error: Wrong Code!</p>
                ) : (
                  <p></p>
                )}
          
      </div>
    
      <AntButton_primary text={"Verify"} onClick={VerifyClickHandler}></AntButton_primary>

    </div>
    </div>
  )
}
