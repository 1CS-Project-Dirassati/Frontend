"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { message, Spin } from "antd";

import apiCall from "@/components/utils/apiCall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TeacherProfile({ params }) {
  const { id } = params;
  const token = useSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await apiCall("get", `/api/teachers/${id}`, null, { token });
        setTeacher(response.teacher);
      } catch (error) {
        message.error("Failed to load teacher data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, [id, token]);

  const accentColor = "#4FD1C5";
  const bgGradient = `linear-gradient(135deg, ${accentColor}33, ${accentColor})`;

  // Chart Configs (STATIC)
  const teachingActivityChart = {
    options: {
      chart: { id: "teaching-activity" },
      xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      colors: [accentColor],
    },
    series: [{ name: "Sessions", data: [3, 4, 2, 5, 4] }],
  };

  const moduleDistributionChart = {
    options: {
      labels: ["Math", "Science", "English", "History", "Art"],
      colors: ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
    },
    series: [25, 20, 15, 25, 15],
  };

  const feedbackChart = {
    options: {
      chart: { id: "feedback" },
      labels: ["Clarity", "Punctuality", "Knowledge", "Support", "Communication"],
    },
    series: [90, 85, 95, 88, 92],
  };

  const hoursTaughtChart = {
    options: {
      chart: { id: "teaching-hours" },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
      colors: ["#A855F7"],
    },
    series: [{ name: "Hours", data: [40, 48, 50, 45, 60] }],
  };

  const attendanceChart = {
    options: {
      labels: ["Present", "Absent", "Late"],
      colors: ["#10B981", "#EF4444", "#F59E0B"],
    },
    series: [90, 5, 5],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-white">
        <Card className="bg-background border-primary shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-text text-2xl">Teacher Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin/teachers")}
              className="bg-secondary hover:bg-accent text-background"
            >
              Back to Teachers
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${teacher.first_name} ${teacher.last_name}`;
  const profileImg = teacher.profile_picture?.startsWith("http")
    ? teacher.profile_picture
    : `/${teacher.profile_picture}`;

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text p-6">Teacher Dashboard</h1>

        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative">
            <div className="h-32 w-full" style={{ background: bgGradient }} />
            <Avatar className="absolute top-16 left-6 w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={profileImg} alt={fullName} />
              <AvatarFallback className="bg-secondary text-background text-2xl">
                {teacher.first_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="pt-20">
            <CardTitle className="text-2xl font-semibold text-text">{fullName}</CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-text mb-1">Email:</p>
              <p className="text-lg text-muted-foreground mb-4">{teacher.email}</p>

              <p className="font-medium text-text mb-1">Phone:</p>
              <p className="text-lg text-muted-foreground mb-4">{teacher.phone_number}</p>

              <p className="font-medium text-text mb-1">Address:</p>
              <p className="text-lg text-muted-foreground mb-4">{teacher.address}</p>

              <p className="font-medium text-text mb-1">Joined:</p>
              <p className="text-lg text-muted-foreground mb-4">
                {new Date(teacher.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold mb-2">Module Distribution</h3>
              <Chart options={moduleDistributionChart.options} series={moduleDistributionChart.series} type="donut" height={250} />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Teaching Activity (Weekly)</h3>
              <Chart options={teachingActivityChart.options} series={teachingActivityChart.series} type="bar" height={250} />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Student Feedback</h3>
              <Chart options={feedbackChart.options} series={[feedbackChart.series]} type="radar" height={250} />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Teaching Hours (Monthly)</h3>
              <Chart options={hoursTaughtChart.options} series={hoursTaughtChart.series} type="area" height={250} />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Attendance Overview</h3>
              <Chart options={attendanceChart.options} series={attendanceChart.series} type="pie" height={250} />
            </div>
          </CardContent>

          <CardContent>
            <div className="flex justify-end mt-6">
              <ShadcnButton
                onClick={() => router.push("/admin/teachers")}
                className="bg-secondary hover:bg-accent text-background"
              >
                Back to Teachers
              </ShadcnButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
