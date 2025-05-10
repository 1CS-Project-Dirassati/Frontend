"use client";
import style from "../../style.module.css";
import AntButton_primary from "@/components/ui/antButton_primary ";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input_Password from "@/components/ui/input_password";
import { useSelector } from "react-redux";
import { message } from "antd";
import { Phone } from "lucide-react";

export default function ResetPassword() {
  const isVerifiedOTP = useSelector((state) => state.resetPassword.isVerifiedOTP);
  const dataState = useSelector((state)=> state.resetPassword);
 console.log(dataState)
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [status, setStatus] = useState("error");

  // Individual password validation checks
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isValidLength, setIsValidLength] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const validatePassword = (value) => {
    const numberCheck = /\d/.test(value);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const lengthCheck = value.length >= 8;

    setHasNumber(numberCheck);
    setHasSpecialChar(specialCharCheck);
    setIsValidLength(lengthCheck);

    return numberCheck && specialCharCheck && lengthCheck;
  };

  const handleChangePassword = (value) => {
    setPassword(value);
    const isValid = validatePassword(value);
    setIsMatching(value === confirmationPassword);

    setStatus(isValid ? "success" : "error");
  };

  const handleChangeConfirmationPassword = (value) => {
    setConfirmationPassword(value);
    setIsMatching(value === password);
  };

  // Button is enabled only when:
  // - Password is valid (status === "success")
  // - Confirmation password matches new password
  const isButtonDisabled = status === "error" || !isMatching;

  const VerifyClickHandler = async (e) => {
    
    try{
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp-reset`, {
       method: "POST",
       headers: new Headers({
         'Content-Type': 'application/json',
         'Accept': 'application/json'
       }),
       body: JSON.stringify({
         password: password,
         phoneNumber: `${dataState.email}`,
         otp: dataState.otp,
 
       }),
     })
     const data = await response.json();
     if (response.ok) {
      router.push("/signin");
    } 
   }
   catch (error) {
     console.error("error:", error);
   }

}

  if (!isVerifiedOTP) {
    router.push("/signin/reset-password");
  } else {
    return (
      <div className={style.container}>
        <div className={style.Form}>
          <h1 className={style.custom_text}>Reset Password</h1>

          <div className={style.InputContainer}>
            <p className={style.text}>New Password</p>
            <Input_Password Status={status} inputValue={password} onInputChange={handleChangePassword} />

          </div>

          <div className={style.InputContainer}>
            <p className={style.text}>Confirm New Password</p>
            <Input_Password inputValue={confirmationPassword} onInputChange={handleChangeConfirmationPassword} />

       
            <div style={{ marginLeft: "5px", fontSize: "14px", lineHeight: "1.5", fontWeight: "bold" }}>
            <p style={{ color: isValidLength ? "green" : "red" }}>
                {isValidLength ? "✅" : "❌"} At least 8 characters long
              </p>
              <p style={{ color: hasNumber ? "green" : "red" }}>
                {hasNumber ? "✅" : "❌"} Contains at least one number (0-9)
              </p>
              <p style={{ color: hasSpecialChar ? "green" : "red" }}>
                {hasSpecialChar ? "✅" : "❌"} Contains at least one special character (!@#$%^&*())
              </p>
              <p style={{ color: isMatching ? "green" : "red" }}>
                {isMatching ? "✅" : "❌"} New password and confirmation password match
              </p>
            </div>
          </div>

          <AntButton_primary text={"Send Verification Email"} onClick={VerifyClickHandler} disabled={isButtonDisabled} />
        </div>
      </div>
    );
  }
}
