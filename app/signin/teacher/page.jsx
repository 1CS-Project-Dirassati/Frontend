"use client";
import style from "../style.module.css"
import  AntButton_primary   from "@/components/ui/antButton_primary ";
import  Input  from "@/components/ui/antInput";
import Input_Password  from "@/components/ui/input_password";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector,useDispatch } from "react-redux";
import { setToken } from "../../redux/features/auth/authSlice";
import {persistor} from "../../redux/store";
import apiCall from "../../../components/utils/apiCall";
export default function SignInPage() {
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status,setStatus] = useState("");
  const dispatch = useDispatch();


  const token = useSelector((state) => state.auth.token);

  const handleChangeEmail = (value) => {
    setEmail(value);
  };
  const signupClickHandler = async (e) => {
    try {
      const dataUser = { email:email, password:password,role:"teacher" };
      const result = await apiCall('POST', '/auth/login', dataUser);    
      const access_Token = result.access_token;
      const refresh_Token = result.refresh_token;
    if (result.status === true){ 
      const Rolle="teacher";
      dispatch(setToken({accessToken:access_Token,refreshToken:refresh_Token,role:Rolle})); 
      router.push("/teacher")
      
    } else {
      setStatus("Invalid email or password");
    }
    } catch (error) {
      console.error("Login error:", error);
      setStatus("Something went wrong");
    }
    };

  const handleChangePassword = (newValue) => {
    setStatus("");
    setPassword(newValue);
  };
  if (token){
    router.push("/parent")
  }
  else {

  return (
    <div className={style.container}>
      <div className={style.Form}>
        <h1 className={style.custom_text}>Sign In</h1>
        <p className={style.custom_subText}>
          Don’t have an account?  <span className="text-red-500 cursor-pointer underline" onClick={()=>router.push("/signup")} >Create now</span>
        </p>
        <div className={style.InputContainer}>
          <p className={style.text}>E-mail</p>

             <Input placeHolder={"example@gmail.com"} Status={status} inputValue={email} onInputChange={handleChangeEmail}></Input>
       </div>
        <div className={style.InputContainer}>
          <p className={style.text}>Password</p>
          <Input_Password  Status={status} inputValue={password} onInputChange={handleChangePassword}></Input_Password>
      </div>
      <p className={style.custom_Text_forgotPassword} onClick={()=>router.push("/signin/reset-password")}>
           <span className="text-red-500 cursor-pointer underline" style={{display:"flex",justifyContent:"end"}}>Forgot Password?</span>
        </p>
      <AntButton_primary text={"Sign Up"} onClick={signupClickHandler}></AntButton_primary>

    </div>
    </div>
  )
}
}
