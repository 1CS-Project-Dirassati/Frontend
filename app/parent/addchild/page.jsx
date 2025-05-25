"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import AntInput from "@/components/ui/antInput";
import AntButton_primary from "@/components/ui/antButton_primary ";

export default function AddChild() {
  const accesstoken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    docs_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setMessage({ type: "error", text: "Invalid email format." });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await apiCall("post", "api/students/add-child", formData, {
        token:accesstoken,
      });
      setMessage({ type: "success", text: "Child added successfully!" });
      setFormData({ first_name: "", last_name: "", email: "", docs_url: "" });
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
          <label className="block text-sm font-medium mb-1">Documents URL</label>
          <AntInput
            type="url"
            name="docs_url"
            placeHolder="Enter documents URL"
            inputValue={formData.docs_url}
            onInputChange={(value) => handleChange({ target: { name: "docs_url", value } })}
            required
          />
        </div>
        <AntButton_primary
          text={isSubmitting ? "Submitting..." : "Add Child"}
          onClick={handleSubmit}
          disabled={isSubmitting}
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
