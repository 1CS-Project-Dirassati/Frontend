"use client";

import { useEffect, useState } from "react";
import apiCall from "@/components/utils/apiCall";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";

export default function StudentProfilePage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    docs_url: "",
    level_id: "",
    group_id: "",
    parent_id: "",
    archived: false,
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall("GET", "/api/students/me", null, { token });
        const student = res.student || res;
        setProfile({
          first_name: student.first_name || "",
          last_name: student.last_name || "",
          email: student.email || "",
          docs_url: student.docs_url || "",
          level_id: student.level_id || "",
          group_id: student.group_id || "",
          parent_id: student.parent_id || "",
          archived: student.archived || false,
          created_at: student.created_at || "",
          updated_at: student.updated_at || "",
        });
      } catch (err) {
        toast.error("Failed to load student profile");
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
        level_id,
        group_id,
        parent_id,
        archived,
        created_at,
        updated_at,
        ...payload
      } = profile;

      await apiCall("PUT", "/api/students/me", payload, { token });
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
      <h1 className="text-2xl font-semibold mb-4">Student Profile</h1>

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
          <label className="block text-sm mb-1">Document URL</label>
          <Input
            name="docs_url"
            type="url"
            value={profile.docs_url}
            onChange={handleChange}
            placeholder="https://docs.example.com"
          />
        </div>

        {/* Display Read-Only Info */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted">
          <p>
            <span className="font-medium">Level ID:</span> {profile.level_id}
          </p>
          <p>
            <span className="font-medium">Group ID:</span> {profile.group_id}
          </p>
          <p>
            <span className="font-medium">Parent ID:</span> {profile.parent_id}
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
