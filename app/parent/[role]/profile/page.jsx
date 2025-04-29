"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"; // Updated to sonner
import { Upload, Lock, Save, User, Mail, Phone, Home, Camera } from "lucide-react";
import {
  getStudents,
  getParents,
  getTeachers,
  getAdmins,
  updateStudent,
  updateParent,
  updateTeacher,
  updateAdmin,
} from "../../data/studentsData";

const ProfilePage = () => {
  const router = useRouter();
  const { role } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    // Mock authenticated user fetch based on role
    let fetchedUser;
    switch (role) {
      case "student":
        fetchedUser = getStudents()[0]; // First student
        break;
      case "parent":
        fetchedUser = getParents()[0];
        break;
      case "teacher":
        fetchedUser = getTeachers()[0];
        break;
      case "admin":
        fetchedUser = getAdmins()[0];
        break;
      default:
        router.push("/admin_test");
        return;
    }
    setUser(fetchedUser);
    setFormData(fetchedUser);
    setPreviewUrl(fetchedUser?.profile_picture || "/images/default_profile.png");
  }, [role, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        //toast.error("Image must be under 2MB.");
        return;
      }
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        //
        // toast.error("Only PNG or JPEG images are allowed.");
        return;
      }
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      //toast.error("Invalid email address.");
      return false;
    }
    if (!formData.phone_number || !/^\+?\d{10,15}$/.test(formData.phone_number)) {
      //toast.error("Invalid phone number.");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      //toast.error("Passwords do not match.");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      //toast.error("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // Mock API call
      const updates = { ...formData };
      if (profilePic) {
        // Simulate upload
        updates.profile_picture = `/images/${profilePic.name || "uploaded.png"}`;
      }

      switch (role) {
        case "student":
          updateStudent(user.id, updates);
          break;
        case "parent":
          updateParent(user.id, updates);
          break;
        case "teacher":
          updateTeacher(user.id, updates);
          break;
        case "admin":
          updateAdmin(user.id, updates);
          break;
      }

      setUser(updates);
      setIsEditing(false);
      setProfilePic(null);
      //toast.success("Profile updated successfully!", {
      //  style: { background: "#1ABC9C", color: "#FFFFFF" },
      //});
    } catch (error) {
      //toast.error("Failed to update profile.", {
      //  style: { background: "#EA5455", color: "#FFFFFF" },
      //});
    }
  };

  const handlePasswordSave = async () => {
    if (!validatePassword()) return;

    try {
      // Mock password update (backend verifies oldPassword, hashes newPassword)
      /* toast.success("Password updated successfully!", {
        style: { background: "#1ABC9C", color: "#FFFFFF" },
      }); */
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      /* toast.error("Failed to update password.", {
        style: { background: "#EA5455", color: "#FFFFFF" },
      }); */
    }
  };

  if (!user) return <div className="text-center text-text-muted">Loading...</div>;

  const renderRoleSpecific = () => {
    switch (role) {
      case "admin":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="is_super_admin" className="text-text">
                Super Admin
              </Label>
              <Checkbox
                id="is_super_admin"
                checked={formData.is_super_admin}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("is_super_admin", checked)
                }
                disabled={!isEditing || !user.is_super_admin}
                className="border-border"
              />
            </div>
          </div>
        );
      case "parent":
        return (
          <div className="grid gap-4">
            <div>
              <Label className="text-text">Linked Students</Label>
              <div className="p-2 bg-background-dark rounded-md text-text">
                {getStudents()
                  .filter((s) => s.parent_id === user.id)
                  .map((s) => `${s.first_name} ${s.last_name}`)
                  .join(", ") || "None"}
              </div>
            </div>
            <div>
              <Label htmlFor="fees_id" className="text-text">Fees Status</Label>
              <Input
                id="fees_id"
                value={formData.fees_id ? `Fee ID: ${formData.fees_id}` : "No fees assigned"}
                disabled
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="is_email_verified" className="text-text">
                Email Verified
              </Label>
              <Checkbox
                id="is_email_verified"
                checked={formData.is_email_verified}
                disabled
                className="border-border"
              />
            </div>
            <div>
              <Label htmlFor="is_phone_verified" className="text-text">
                Phone Verified
              </Label>
              <Checkbox
                id="is_phone_verified"
                checked={formData.is_phone_verified}
                disabled
                className="border-border"
              />
            </div>
          </div>
        );
      case "teacher":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="module_key" className="text-text">Module Key</Label>
              <Input
                id="module_key"
                name="module_key"
                value={formData.module_key || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., MATH101"
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label className="text-text">Assigned Groups</Label>
              <div className="p-2 bg-background-dark rounded-md text-text">
                {getGroups().filter((g) => g !== "All").join(", ") || "None"}
              </div>
            </div>
          </div>
        );
      case "student":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="level_id" className="text-text">Level</Label>
              <Input
                id="level_id"
                value={formData.level_id ? `Grade ${formData.level_id + 8}` : "N/A"}
                disabled
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="group_id" className="text-text">Group</Label>
              <Input
                id="group_id"
                value={formData.group_id || "Unassigned"}
                disabled
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="parent_id" className="text-text">Parent</Label>
              <Input
                id="parent_id"
                value={
                  getParents().find((p) => p.id === formData.parent_id)?.email ||
                  "N/A"
                }
                disabled
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="is_approved" className="text-text">Approved</Label>
              <Checkbox
                id="is_approved"
                checked={formData.is_approved}
                disabled
                className="border-border"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-background font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6 flex items-center gap-2 animate-fade-in">
          <User className="w-8 h-8 text-primary" />{" "}
          {role.charAt(0).toUpperCase() + role.slice(1)} Profile
        </h1>
        <Card className="bg-background-light shadow-card animate-slide-up">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold text-text">
              Personal Information
            </CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={`${
                isEditing
                  ? "bg-accent text-text-inverted hover:bg-accent-light"
                  : "bg-primary text-text-inverted hover:bg-primary-light"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={previewUrl} alt="Profile" />
                <AvatarFallback>
                  <User className="w-12 h-12 text-text-muted" />
                </AvatarFallback>
              </Avatar>
              {isEditing && ["parent", "teacher", "student"].includes(role) && (
                <Button
                  variant="outline"
                  className="border-border text-text hover:bg-background-dark"
                  onClick={() => document.getElementById("profile-pic").click()}
                >
                  <Camera className="w-4 h-4 mr-2" /> Change Picture
                </Button>
              )}
              <input
                id="profile-pic"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-text">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., John"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-text">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Doe"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-text">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="phone_number" className="text-text">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., +1234567890"
                  className="border-border bg-background-light text-text"
                />
              </div>
              {["parent", "teacher"].includes(role) && (
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-text">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., 123 Main St"
                    className="border-border bg-background-light text-text"
                  />
                </div>
              )}
            </div>
            {renderRoleSpecific()}
            {isEditing && (
              <Button
                onClick={handleSave}
                className="bg-primary text-text-inverted hover:bg-primary-light w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="mt-6 bg-background-light shadow-card animate-slide-up delay-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-text">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="oldPassword" className="text-text">
                Old Password
              </Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-text">
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="border-border bg-background-light text-text"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-text">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="border-border bg-background-light text-text"
              />
            </div>
            <Button
              onClick={handlePasswordSave}
              className="bg-accent text-text-inverted hover:bg-accent-light w-full sm:w-auto"
            >
              <Lock className="w-4 h-4 mr-2" /> Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;