"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function Step1({ nextStep, setParentInfo }) {
  const [showPassword, setShowPassword] = useState(false);

  // For development, you can skip validations by setting this to true.
  const skipValidation = false;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [offersChecked, setOffersChecked] = useState(false);
  const [errors, setErrors] = useState({});

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Mock API check (always returns false for now)
  async function checkEmailExists(emailToCheck) {
    return Promise.resolve(false);
  }

  async function handleNext() {
    if (skipValidation) {
      // Save parent's info
      setParentInfo({ email, password, phone, termsChecked, offersChecked });
      nextStep();
      return;
    }

    const newErrors = {};
    if (phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format.";
    } else {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        newErrors.email = "Email already exists.";
      }
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!termsChecked) {
      newErrors.terms = "You must agree to the Terms of use and Privacy Policy.";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setParentInfo({ email, password, phone, termsChecked, offersChecked });
      nextStep();
    }
  }

  return (
    <div className="flex flex-col justify-center px-16">
      <h1 className="text-4xl font-bold">Sign Up</h1>
      <p className="mt-2 text-gray-600">
        Have an account? <span className="text-red-500 cursor-pointer">Connect now</span>
      </p>

      <div className="mt-6 space-y-4">
        {/* Email */}
        <div>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password with Eye toggle */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-4 top-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

        {/* Confirm Password */}
        <div>
          <Input
            type="password"
            placeholder="Confirm Password"
            className="w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Phone */}
        <div>
          <Input
            type="text"
            placeholder="Phone Number"
            className="w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={termsChecked} onCheckedChange={(checked) => setTermsChecked(checked)} />
          <label htmlFor="terms" className="text-sm">
            By creating an account, you agree to the <span className="text-blue-500">Terms of use</span> and <span className="text-blue-500">Privacy Policy</span>.
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}

        {/* Offers Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox id="offers" checked={offersChecked} onCheckedChange={(checked) => setOffersChecked(checked)} />
          <label htmlFor="offers" className="text-sm">
            I want to receive Emails about our offers in the future.
          </label>
        </div>
        {errors.offers && <p className="text-red-500 text-sm mt-1">{errors.offers}</p>}

        <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
          Next
        </Button>
      </div>
    </div>
  );
}
