import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Step2({ nextStep }) {
  return (
    <div className="flex flex-col justify-center px-16">
      <h1 className="text-4xl font-bold">Sign Up</h1>
      <p className="mt-2 text-gray-600">
        Have an account?{" "}
        <span className="text-red-500 cursor-pointer">Connect now</span>
      </p>
      
      <p className="mt-6 text-gray-600">
        We have sent an OTP SMS to your phone number, please write it down here
      </p>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          OTP Code
        </label>
        <Input type="text" placeholder=". . . . ." className="w-full mt-2" />
      </div>
      
      <Button
        onClick={nextStep}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
      >
        Next
      </Button>
    </div>
  );
}
