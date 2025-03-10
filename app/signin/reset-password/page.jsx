"use client";
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import EmailValidation from "@/components/ui/EmailValidation";
import Input from "@/components/ui/AntInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {  useDispatch } from "react-redux";
import { setEmail } from "../../redux/features/resetPasswordSlice";
import style from "../style.module.css"
export default function ResetPassword(){
  const router = useRouter();
  const [email, setLocalEmail ] = useState("");
  const [status,setStatus] = useState("");
  const [disabled, setDisabled] = useState(true);
  const dispatch = useDispatch();

  const handleChangeEmail = (value) => {

    setLocalEmail(value);
    const isValid = EmailValidation(value); 
    setDisabled(!isValid);
    setStatus(!value ? "" : isValid ? "" : "error");

  };

  const VerifyClickHandler =  (e) => {
    dispatch(setEmail(email));
    router.push(`/signin/reset-password/email-validation`);
  }





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
