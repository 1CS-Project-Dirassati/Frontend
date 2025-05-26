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

export default function ParentProfile({ params }) {
  const { id } = params;
  const token = useSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const [parent, setParent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const response = await apiCall("get", `/api/parents/${id}`, null, { token });
        setParent(response.parent);
      } catch (error) {
        message.error("Failed to load parent data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParent();
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

  const meetingsChart = {
    options: {
      chart: { id: "meetings" },
      xaxis: { categories: ["Q1", "Q2", "Q3", "Q4"] },
      colors: [accentColor],
    },
    series: [{ name: "Meetings", data: [2, 3, 1, 4] }],
  };

  const engagementChart = {
    options: {
      chart: { id: "engagement" },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
      colors: ["#34D399"],
    },
    series: [{ name: "Engagement", data: [20, 40, 60, 50, 70] }],
  };

  const satisfactionChart = {
    options: {
      labels: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
      colors: ["#10B981", "#60A5FA", "#FBBF24", "#EF4444"],
    },
    series: [45, 35, 15, 5],
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

  if (!parent) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-background border-primary shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-text text-2xl">Parent Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin/parents")}
              className="bg-secondary hover:bg-accent text-background"
            >
              Back to Parents
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${parent.first_name} ${parent.last_name}`;
  const profileImg = parent.profile_picture?.startsWith("http")
    ? parent.profile_picture
    : `/${parent.profile_picture}`;

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text p-6">Parent Dashboard</h1>

        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative">
            <div className="h-32 w-full" style={{ background: bgGradient }} />
            <Avatar className="absolute top-16 left-6 w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={profileImg} alt={fullName} />
              <AvatarFallback className="bg-secondary text-background text-2xl">
                {parent.first_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="pt-20">
            <CardTitle className="text-2xl font-semibold text-text">{fullName}</CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-text mb-1">Email:</p>
              <p className="text-lg text-muted-foreground mb-4">{parent.email}</p>

              <p className="font-medium text-text mb-1">Phone:</p>
              <p className="text-lg text-muted-foreground mb-4">{parent.phone_number}</p>

              <p className="font-medium text-text mb-1">Address:</p>
              <p className="text-lg text-muted-foreground mb-4">{parent.address}</p>

              <p className="font-medium text-text mb-1">Children:</p>
              <p className="text-lg text-muted-foreground mb-4">{parent.children?.length || 0}</p>
            </div>

            <div className="rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
              <Chart options={gradeDistributionChart.options} series={gradeDistributionChart.series} type="donut" height={250} />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Student Performance</h3>
              <Chart options={performanceChart.options} series={[performanceChart.series]} type="radar" height={250} />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Parent Meetings (Quarterly)</h3>
              <Chart options={meetingsChart.options} series={meetingsChart.series} type="bar" height={250} />
            </div>
          </CardContent>

          <CardContent className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Engagement Over Time</h3>
              <Chart options={engagementChart.options} series={engagementChart.series} type="line" height={250} />
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold mb-2">Satisfaction Survey</h3>
              <Chart options={satisfactionChart.options} series={satisfactionChart.series} type="pie" height={250} />
            </div>
          </CardContent>

          <CardContent>
            <div className="flex justify-end mt-6">
              <ShadcnButton
                onClick={() => router.push("/admin/parents")}
                className="bg-secondary hover:bg-accent text-background"
              >
                Back to Parents
              </ShadcnButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
