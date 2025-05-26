"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import apiCall from "@/components/utils/apiCall";
import AntInput from "@/components/ui/antInput";
import AntButton_primary from "@/components/ui/antButton_primary ";

export default function AddChild() {
  const accesstoken = useSelector((state) => state.auth.accessToken);
  const CLOUD_NAME = "dur1dba1a"; // Replace with your Cloudinary cloud name
  const UPLOAD_PRESET = "student_docs_unsigned"; // Replace with your upload preset

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    docs_url: "",
    level: "",
    date_of_birth: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadUrls, setUploadUrls] = useState([]);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date_of_birth" && { age: calculateAge(value) }),
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const folderId = `student_docs/${uuidv4()}`;

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", UPLOAD_PRESET);
          data.append("folder", folderId);

          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
            data
          );
          return res.data.secure_url;
        })
      );
      setUploadUrls(urls);
      setFormData((prev) => ({ ...prev, docs_url: folderId }));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setMessage({ type: "error", text: "Invalid email format." });
      return;
    }

    if (!formData.docs_url) {
      setMessage({ type: "error", text: "Please upload documents first." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await apiCall("post", "/api/students/add-child", formData, {
        token: accesstoken,
      });
      setMessage({ type: "success", text: "Child added successfully!" });
      setFormData({ first_name: "", last_name: "", email: "", docs_url: "", level: "", date_of_birth: "" });
      setUploadUrls([]);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add child. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Child</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <AntInput
            type="text"
            name="first_name"
            placeHolder="Enter first name"
            inputValue={formData.first_name}
            onInputChange={(value) => handleChange({ target: { name: "first_name", value } })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <AntInput
            type="text"
            name="last_name"
            placeHolder="Enter last name"
            inputValue={formData.last_name}
            onInputChange={(value) => handleChange({ target: { name: "last_name", value } })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <AntInput
            type="email"
            name="email"
            placeHolder="Enter email"
            inputValue={formData.email}
            onInputChange={(value) => handleChange({ target: { name: "email", value } })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <AntInput
            type="date"
            name="date_of_birth"
            placeHolder="Enter date of birth"
            inputValue={formData.date_of_birth}
            onInputChange={(value) => handleChange({ target: { name: "date_of_birth", value } })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Level</label>
          <AntInput
            type="text"
            name="level"
            placeHolder="Enter level"
            inputValue={formData.level}
            onInputChange={(value) => handleChange({ target: { name: "level", value } })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Documents</label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="w-full text-sm border rounded p-2"
          />
          {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
          {uploadUrls.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-green-600">
              {uploadUrls.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                    Document {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <AntButton_primary
          text={isSubmitting ? "Submitting..." : "Add Child"}
          onClick={handleSubmit}
          disabled={isSubmitting || uploading}
        />
      </form>
      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}