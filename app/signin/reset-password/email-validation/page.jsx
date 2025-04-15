"use client";
import style from "../../style.module.css"
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import { useState,useEffect } from "react";
import OTP from "@/components/ui/OTPInput";
import {  useDispatch ,useSelector} from "react-redux";
import { verifyOTP,resetOTP } from "../../../redux/features/resetPasswordSlice";
import { useRouter } from "next/navigation";

export default function emailVerification() {
  const router = useRouter();
  const [otp, setOTP] = useState('');
  const [status, setStatus] = useState("");
  const email = useSelector((state) => state.resetPassword.email);
  const rightotp = useSelector((state) => state.resetPassword.otp);
  console.log(rightotp)
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetOTP()); // Reset OTP state when the component mounts
  },[dispatch]);

  const handleOTPChange = (index, value) => {
    const newOTP = otp.slice(0, index) + value + otp.slice(index + 1);
    setOTP(newOTP);
  };

  const VerifyClickHandler =  (e) => {
     if(otp===rightotp){
      dispatch(verifyOTP());
      router.push("/signin/reset-password/new-password")
      setStatus(null)
     }
     else{
      dispatch(resetOTP());
       setStatus("error")
     }
  }


  if (email === "") {
    router.push("/signin/reset-password");
  }
  else{




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
} 
