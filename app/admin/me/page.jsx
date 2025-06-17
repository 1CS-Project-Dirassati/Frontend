"use client";

import { useEffect, useState } from "react";
import apiCall from "@/components/utils/apiCall";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";

export default function AdminProfilePage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    is_super_admin: false,
    created_at: "",
    updated_at: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall("GET", "/api/admins/me", null, { token });
        const admin = res.admin || res; // fallback if it's directly the profile object
        setProfile({
          first_name: admin.first_name || "",
          last_name: admin.last_name || "",
          email: admin.email || "",
          phone_number: admin.phone_number || "",
          is_super_admin: admin.is_super_admin || false,
          created_at: admin.created_at || "",
          updated_at: admin.updated_at || "",
        });
        console.log("Profile loaded:", admin);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { id, is_super_admin, created_at, updated_at, ...payload } =
        profile;
      await apiCall("PUT", "/api/admins/me", payload, {token});

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin h-6 w-6 text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background-light rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Profile</h1>
        {profile.is_super_admin && (
          <Badge
            variant="outline"
            className="text-green-700 border-green-600 flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" /> Super Admin
          </Badge>
        )}
      </div>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label className="block text-sm mb-1">First Name</label>
          <Input
            name="first_name"
            value={profile.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Last Name</label>
          <Input
            name="last_name"
            value={profile.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Email</label>
          <Input
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Phone Number</label>
          <Input
            name="phone_number"
            value={profile.phone_number}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2 flex items-center justify-between mt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>

          <div className="text-sm text-muted">
            <p>
              Created:{" "}
              {profile.created_at
                ? new Date(profile.created_at).toLocaleString()
                : "N/A"}
            </p>
            <p>
              Updated:{" "}
              {profile.updated_at
                ? new Date(profile.updated_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
