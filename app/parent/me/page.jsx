"use client";

import { useEffect, useState } from "react";
import apiCall from "@/components/utils/apiCall";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";

export default function ParentProfilePage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    profile_picture: "",
    is_email_verified: false,
    is_phone_verified: false,
    archived: false,
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall("GET", "/api/parents/me", null, { token });
        const parent = res.parent || res;

        setProfile({
          first_name: parent.first_name || "",
          last_name: parent.last_name || "",
          email: parent.email || "",
          phone_number: parent.phone_number || "",
          address: parent.address || "",
          profile_picture: parent.profile_picture || "",
          is_email_verified: parent.is_email_verified || false,
          is_phone_verified: parent.is_phone_verified || false,
          archived: parent.archived || false,
          created_at: parent.created_at || "",
          updated_at: parent.updated_at || "",
        });
      } catch (err) {
        toast.error("Failed to load parent profile");
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
      const {
        is_email_verified,
        is_phone_verified,
        archived,
        created_at,
        updated_at,
        ...payload
      } = profile;

      await apiCall("PUT", "/api/parents/me", payload, { token });
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
      <h1 className="text-2xl font-semibold mb-4">Parent Profile</h1>

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

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Address</label>
          <Input
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Profile Picture URL</label>
          <Input
            name="profile_picture"
            type="url"
            value={profile.profile_picture}
            onChange={handleChange}
          />
        </div>

        {/* Read-only details */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted">
          <p>
            <span className="font-medium">Email Verified:</span>{" "}
            {profile.is_email_verified ? (
              <Badge variant="default">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </p>
          <p>
            <span className="font-medium">Phone Verified:</span>{" "}
            {profile.is_phone_verified ? (
              <Badge variant="default">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </p>
          <p>
            <span className="font-medium">Archived:</span>{" "}
            {profile.archived ? (
              <Badge variant="destructive">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </p>
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
