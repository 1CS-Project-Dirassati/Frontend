"use client";
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import EmailValidation from "@/components/ui/EmailValidation";
import Input from "@/components/ui/AntInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {  useDispatch,useSelector } from "react-redux";
import { setEmail,setOtp } from "../../redux/features/auth/resetPasswordSlice";
import style from "../style.module.css"
export default function ResetPassword(){
  const extractOtpFromMessage = (message) => {
    const match = message.match(/otp\s*:\s*(\d{4,6})/i);
    return match ? match[1] : null;
  };
  const router = useRouter();
  const [email, setLocalEmail ] = useState("");
  const [status,setStatus] = useState("");
  const [disabled, setDisabled] = useState(true);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const handleChangeEmail = (value) => {

    setLocalEmail(value);
    const isValid = EmailValidation(value); 
    //setDisabled(!isValid);
    setDisabled(false);
    setStatus(!value ? "" : isValid ? "" : "error");

  };

  const VerifyClickHandler = async (e) => {
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: "POST",
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          phoneNumber: `+123${email}`, 
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const otp = extractOtpFromMessage(data.message);
        dispatch(setOtp(otp));
        dispatch(setEmail(email));
        router.push(`/signin/reset-password/email-validation`);
      } else {
        setStatus("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setStatus("Something went wrong");
    }
  }



  if (token){
    router.push("/home")
  }
  else {

  return (
    <div className={style.container}>
      <div className={style.Form}>
        <h1 className={style.custom_text}>Reset Password</h1>
        <div className={style.InputContainer}>
          <p className={style.text}>E-mail</p>
             <Input placeHolder={"example@gmail.com"} Status={status} inputValue={email} onInputChange={handleChangeEmail} ></Input>
       </div>  
      <AntButton_primary text={"Send Verification Email"} onClick={VerifyClickHandler} disabled={disabled}></AntButton_primary>
    </div>
    </div>
  )
}
}