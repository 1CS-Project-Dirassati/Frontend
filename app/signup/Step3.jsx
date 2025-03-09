"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Step3({ nextStep, setKidsCount }) {
  const [source, setSource] = useState("");
  const [count, setCount] = useState("");

  function handleNext() {
    if (count) {
      setKidsCount(Number(count));
    }
    nextStep();
  }

  return (
    <div className="flex flex-col justify-center px-16">
      <h1 className="text-4xl font-bold">Sign Up</h1>
      <p className="mt-2 text-gray-600">
        Have an account? <span className="text-red-500 cursor-pointer">Connect now</span>
      </p>
      
      <div className="mt-6 space-y-6">
        {/* Dropdown for "Where did you hear about us?" */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Where did you hear about us?
          </label>
          <Select onValueChange={(val) => setSource(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Menu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Friends">Friends</SelectItem>
              <SelectItem value="Advertisement">Advertisement</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Dropdown for number of kids */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How many kids do you wanna tjhom andna?
          </label>
          <Select onValueChange={(val) => setCount(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Menu" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleNext}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
      >
        Next
      </Button>
    </div>
  );
}
