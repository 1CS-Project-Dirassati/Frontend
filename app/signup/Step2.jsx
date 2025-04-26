"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Step2({ nextStep, parentInfo }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const res = await fetch("https://dirassati.pythonanywhere.com/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          "origin":"http://exmple.com"
        },
        body: JSON.stringify({
          email: parentInfo.email,
          otp: otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      console.log("✅ OTP verified:", data);
      nextStep();
    } catch (error) {
      console.error("❌ Verification error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col justify-center px-16">
      <h1 className="text-4xl font-bold">Sign Up</h1>
      <p className="mt-2 text-gray-600">
        Have an account? <span className="text-red-500 cursor-pointer">Connect now</span>
      </p>

      <p className="mt-6 text-gray-600">
        We have sent an OTP SMS to your phone number, please write it down here
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">OTP Code</label>
        <Input
          type="text"
          placeholder=". . . . ."
          className="w-full mt-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <Button
        onClick={handleVerify}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
      >
        Verify & Next
      </Button>
    </div>
  );
}
