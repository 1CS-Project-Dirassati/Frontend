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

export default function StudentProfile({ params }) {
  const { id } = useSelector(state=> state.userinfo.userProfile);
  const token = useSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await apiCall("get", `/api/students/${id}`, null, {
          token,
        });
        setStudent(response.student);
      } catch (error) {
        message.error("Failed to load student data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [id, token]);

  const accentColor = "#60A5FA";
  const bgGradient = `linear-gradient(135deg, ${accentColor}33, ${accentColor})`;

  // Chart Configs (STATIC)
  const performanceChart = {
    options: {
      chart: { id: "performance" },
      labels: ["Math", "Science", "English", "History", "Art"],
    },
    series: [85, 78, 90, 72, 88],
  };

  const attendanceChart = {
    options: {
      chart: { id: "attendance" },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
      colors: [accentColor],
    },
    series: [{ name: "Attendance", data: [95, 92, 88, 94, 90] }],
  };

  const engagementChart = {
    options: {
      chart: { id: "engagement" },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
      colors: ["#34D399"],
    },
    series: [{ name: "Engagement", data: [20, 40, 60, 50, 70] }],
  };

  const gradeDistributionChart = {
    options: {
      labels: ["A", "B", "C", "D", "F"],
      colors: ["#22C55E", "#3B82F6", "#F59E0B", "#F97316", "#EF4444"],
    },
    series: [30, 40, 20, 7, 3],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-background border-primary shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-text text-2xl">
              Student Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin/students")}
              className="bg-secondary hover:bg-accent text-background"
            >
              Back to Students
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`;
  const profileImg = student.profile_picture?.startsWith("http")
    ? student.profile_picture
    : `/${student.profile_picture}`;

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text p-6">Student Profile</h1>

        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative">
            <div className="h-32 w-full" style={{ background: bgGradient }} />
            <Avatar className="absolute top-16 left-6 w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={profileImg} alt={fullName} />
              <AvatarFallback className="bg-secondary text-background text-2xl">
                {student.first_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="pt-20">
            <CardTitle className="text-2xl font-semibold text-text">
              {fullName}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-text mb-1">Email:</p>
              <p className="text-lg text-muted-foreground mb-4">
                {student.email}
              </p>

              <p className="font-medium text-text mb-1">Phone:</p>
              <p className="text-lg text-muted-foreground mb-4">
                {student.phone_number}
              </p>

              <p className="font-medium text-text mb-1">Address:</p>
              <p className="text-lg text-muted-foreground mb-4">
                {student.address}
              </p>

              <p className="font-medium text-text mb-1">Grade Level:</p>
              <p className="text-lg text-muted-foreground mb-4">
                {student.grade_level}
              </p>
            </div>

            <div className="rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
              <Chart
                options={gradeDistributionChart.options}
                series={gradeDistributionChart.series}
                type="donut"
                height={250}
              />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">
                Academic Performance
              </h3>
              <Chart
                options={performanceChart.options}
                series={[performanceChart.series]}
                type="radar"
                height={250}
              />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">
                Attendance Over Time
              </h3>
              <Chart
                options={attendanceChart.options}
                series={attendanceChart.series}
                type="bar"
                height={250}
              />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">
                Engagement Over Time
              </h3>
              <Chart
                options={engagementChart.options}
                series={engagementChart.series}
                type="line"
                height={250}
              />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">
                Satisfaction Survey
              </h3>
              <Chart
                options={gradeDistributionChart.options}
                series={gradeDistributionChart.series}
                type="pie"
                height={250}
              />
            </div>
          </CardContent>

          <CardContent>
            <div className="flex justify-end mt-6">
              <ShadcnButton
                onClick={() => router.push("/admin/students")}
                className="bg-secondary hover:bg-accent text-background"
              >
                Back to Students
              </ShadcnButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
