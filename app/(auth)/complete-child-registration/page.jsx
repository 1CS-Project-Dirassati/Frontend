"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "../redux/features/auth/authSlice";
import AntInput from "../../components/ui/antInput";
import AntButton_primary from "../../components/ui/antButton_primary ";
import apiCall from "@/components/utils/apiCall"; // Adjust the import based on your project structure
import { useDispatch } from "react-redux";

export default function CompleteChildRegistration() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null); 
  const[token, setToken] = useState(searchParams.get("token"));
  const dispatch = useDispatch();
     
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
    
   const result= await apiCall("post", "/api/students/complete-child-registration", {
        token:token,
        password:password,
      });
      const access_Token = result.access_token;
      const refresh_Token = result.refresh_token;

       if (result.status === true){ 
            const Rolle="student";
            dispatch(setToken({accessToken:access_Token,refreshToken:refresh_Token,role:Rolle})); 
            router.push("/student")
            
          } else {
            setStatus("Invalid email or password");
          }
      


    } catch (error) {
      setMessage({ type: "error", text: "Failed to complete registration. Please try again." });
    }
  };

  return (
    <div style={{alignContent:"center",display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
    <div className="p-6 max-w-lg mx-auto" >
      <h1 className="text-2xl font-bold mb-4">Complete Registration</h1>
      {message && (
        <p className={`mb-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
      <form  className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <AntInput
            type="password"
            placeHolder="Enter your password"
            inputValue={password}
            onInputChange={setPassword}
            required
          />
        </div>
        <AntButton_primary text="Submit" onClick={handlePasswordSubmit} />
      </form>
    </div>
    </div>
  );
}