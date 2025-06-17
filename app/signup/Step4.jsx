"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "../../lib/firebase"; // Adjust the path as needed
import { v4 as uuidv4 } from "uuid";

export default function Step4({ kidsCount = 1, nextStep, setKidsInfo }) {
  const initialKidsData = Array.from({ length: kidsCount }, () => ({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    certificates: {
      healthAssurance: "",
      scholarCertificate: "",
      extraitDeNaissance: "",
      healthAssurance2: "",
      scholarCertificate2: "",
      extraitDeNaissance2: "",
    },
  }));
  const [kidsData, setKidsData] = useState(initialKidsData);
  const [kidIndex, setKidIndex] = useState(0);
  const currentKid = kidsData[kidIndex];
  const [parentUUID] = useState(uuidv4());

  // Modal state for file upload
  const [openModal, setOpenModal] = useState(false);

  // Toggle validation (set to false to bypass kid validations during development)
  const enableKidValidation = true; // Change to false to skip validations

  // To store error messages for the current kid
  const [errors, setErrors] = useState({});

  // File input refs for certificate uploads
  const fileInputRefs = {
    healthAssurance: useRef(null),
    scholarCertificate: useRef(null),
    extraitDeNaissance: useRef(null),
    healthAssurance2: useRef(null),
    scholarCertificate2: useRef(null),
    extraitDeNaissance2: useRef(null),
  };

  // Simple email regex for kid's email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleFileUpload(certificateType, file) {
    try {
      const storage = getStorage(firebaseApp);
      const fileRef = ref(storage, `${parentUUID}/kid_${kidIndex}/${certificateType}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setKidsData(prevKidsData => {
        const newKidsData = [...prevKidsData];
        newKidsData[kidIndex].certificates[certificateType] = downloadURL;
        return newKidsData;
      });
    } catch (error) {
      console.error("File upload failed:", error);
    }
  }

  function handleFileChange(certificateType, event) {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(certificateType, file);
    }
  }

  function handleKidChange(field, value) {
    setKidsData(prevKidsData => {
      const newKidsData = [...prevKidsData];
      newKidsData[kidIndex][field] = value;
      return newKidsData;
    });
  }

  // Validate that current kid's required fields and all certificate files are present
  function validateCurrentKid() {
    const newErrors = {};
    if (!currentKid.firstName) newErrors.firstName = "First name is required.";
    if (!currentKid.lastName) newErrors.lastName = "Last name is required.";
    if (!currentKid.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(currentKid.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!currentKid.grade) newErrors.grade = "Grade is required.";

    // Validate required certificate files
    if (!currentKid.certificates.healthAssurance) newErrors.healthAssurance = "Health assurance file is required.";
    if (!currentKid.certificates.scholarCertificate) newErrors.scholarCertificate = "Scholar certificate file is required.";
    if (!currentKid.certificates.extraitDeNaissance) newErrors.extraitDeNaissance = "Extrait de naissance file is required.";
    if (!currentKid.certificates.healthAssurance2) newErrors.healthAssurance2 = "Health assurance 2 file is required.";
    if (!currentKid.certificates.scholarCertificate2) newErrors.scholarCertificate2 = "Scholar certificate 2 file is required.";
    if (!currentKid.certificates.extraitDeNaissance2) newErrors.extraitDeNaissance2 = "Extrait de naissance 2 file is required.";

    return newErrors;
  }

  function handleNextKid() {
    if (enableKidValidation) {
      const kidErrors = validateCurrentKid();
      if (Object.keys(kidErrors).length > 0) {
        setErrors(kidErrors);
        return; // Do not proceed if there are errors
      }
    }
    setErrors({});
    if (kidIndex < kidsCount - 1) {
      setKidIndex(kidIndex + 1);
    } else {
      // For the last kid, pass kidsData to parent then proceed
      setKidsInfo(kidsData);
      nextStep();
    }
  }

  function handlePrevKid() {
    if (kidIndex > 0) {
      setKidIndex(kidIndex - 1);
      setErrors({}); // Clear errors when navigating back
    }
  }

  return (
    <div className="flex flex-col justify-center px-16">
      <h1 className="text-4xl font-bold">Sign Up</h1>
      <p className="mt-2 text-gray-600">
        Have an account? <span className="text-red-500 cursor-pointer">Connect now</span>
      </p>

      <div className="mt-6 space-y-4">
        {/* Kid First Name */}
        <div>
          <Input
            type="text"
            placeholder={`Kid ${kidIndex + 1} First Name`}
            value={currentKid.firstName}
            onChange={(e) => handleKidChange("firstName", e.target.value)}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        {/* Kid Last Name */}
        <div>
          <Input
            type="text"
            placeholder={`Kid ${kidIndex + 1} Last Name`}
            value={currentKid.lastName}
            onChange={(e) => handleKidChange("lastName", e.target.value)}
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
        {/* Kid Email */}
        <div>
          <Input
            type="email"
            placeholder={`Kid ${kidIndex + 1} Email`}
            value={currentKid.email}
            onChange={(e) => handleKidChange("email", e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        {/* Kid Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kid {kidIndex + 1} Current Grade
          </label>
          <Select value={currentKid.grade} onValueChange={(val) => handleKidChange("grade", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {["1st Grade", "2nd Grade", "3rd Grade", "4th Grade"].map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
        </div>

        {/* File Upload Section */}
        <div>
          <p className="text-sm text-gray-700">
            Please add the kid's papers after scanning them
          </p>
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2 flex items-center space-x-2">
                <Upload size={16} />
                <span>Upload Kid's files</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[90vw] p-8">
              <DialogHeader>
                <DialogTitle>Upload Kid’s Certificates</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Ensure the files are scanned clearly.
                </DialogDescription>
                <DialogClose className="absolute right-4 top-4">
                  <X className="h-5 w-5" />
                </DialogClose>
              </DialogHeader>
              <div className="mt-4 space-y-8">
                <div className="grid grid-cols-3 gap-10">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Health assurance</p>
                    <Button variant="outline" onClick={() => fileInputRefs.healthAssurance.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.healthAssurance} className="hidden" onChange={(e) => handleFileChange("healthAssurance", e)} />
                    {errors.healthAssurance && <p className="text-red-500 text-sm mt-1">{errors.healthAssurance}</p>}
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Scholar certificate</p>
                    <Button variant="outline" onClick={() => fileInputRefs.scholarCertificate.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.scholarCertificate} className="hidden" onChange={(e) => handleFileChange("scholarCertificate", e)} />
                    {errors.scholarCertificate && <p className="text-red-500 text-sm mt-1">{errors.scholarCertificate}</p>}
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Extrait de naissance</p>
                    <Button variant="outline" onClick={() => fileInputRefs.extraitDeNaissance.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.extraitDeNaissance} className="hidden" onChange={(e) => handleFileChange("extraitDeNaissance", e)} />
                    {errors.extraitDeNaissance && <p className="text-red-500 text-sm mt-1">{errors.extraitDeNaissance}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-10">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Health assurance 2</p>
                    <Button variant="outline" onClick={() => fileInputRefs.healthAssurance2.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.healthAssurance2} className="hidden" onChange={(e) => handleFileChange("healthAssurance2", e)} />
                    {errors.healthAssurance2 && <p className="text-red-500 text-sm mt-1">{errors.healthAssurance2}</p>}
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Scholar certificate 2</p>
                    <Button variant="outline" onClick={() => fileInputRefs.scholarCertificate2.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.scholarCertificate2} className="hidden" onChange={(e) => handleFileChange("scholarCertificate2", e)} />
                    {errors.scholarCertificate2 && <p className="text-red-500 text-sm mt-1">{errors.scholarCertificate2}</p>}
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <p className="font-medium">Extrait de naissance 2</p>
                    <Button variant="outline" onClick={() => fileInputRefs.extraitDeNaissance2.current.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Kid’s file
                    </Button>
                    <input type="file" ref={fileInputRefs.extraitDeNaissance2} className="hidden" onChange={(e) => handleFileChange("extraitDeNaissance2", e)} />
                    {errors.extraitDeNaissance2 && <p className="text-red-500 text-sm mt-1">{errors.extraitDeNaissance2}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8">
                <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setOpenModal(false)}>
                  Validate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={handlePrevKid} disabled={kidIndex === 0} className="bg-gray-200 text-gray-700 py-3 rounded-lg">
          Previous
        </Button>
        <Button onClick={handleNextKid} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
          {kidIndex < kidsCount - 1 ? "Next Kid" : "Next"}
        </Button>
      </div>
    </div>
  );
}
