"use client";

import { Button } from "@/components/ui/button";

export default function Step5() {
  function goHome() {
    // Replace with your actual navigation logic
    // e.g., router.push("/")
    console.log("Going to home screen...");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      <div className="flex gap-x-2">
      <h1 className="text-6xl font-bold mb-6">Sign Up Completed!</h1>
      <img
        src="/signup-completed2.png"
        alt="Completed illustration"
        className="mb-7 w-20"
      />
      </div>
      <p className="text-gray-600 mb-8">
        We are going to send you a notification once we have finalized your admission
      </p>
      <img
        src="/signup-completed.png"
        alt="Completed illustration"
        className="mb-8 w-90 max-h-70"
      />
      <Button
        onClick={goHome}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3  rounded-lg px-20"
      >
        Go to Home Screen
      </Button>
    </div>
  );
}
