"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { students, getParents } from "../../data/studentsData";
import { use } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StudentProfile({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const student = students.find((s) => s.id.toString() === id);
  const parents = getParents();
  const parent = parents.find((p) => p.id === student?.parent_id);

  if (!student) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-background border-border shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-text text-2xl">Student Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin_test/students")}
              className="bg-secondary hover:bg-accent text-background transition-all duration-300"
            >
              Back to Students
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accentColor = "#4FD1C5";
  const studentName = `${student.first_name} ${student.last_name}`;
  const parentName = parent ? `${parent.first_name} ${parent.last_name}` : "N/A";

  const performanceChart = {
    options: {
      chart: { id: "grades" },
      xaxis: { categories: ["Math", "Science", "English", "History", "Art"] },
      colors: [accentColor],
    },
    series: [
      {
        name: "Grades",
        data: [88, 92, 85, 90, 87],
      },
    ],
  };

  const attendanceChart = {
    options: {
      labels: ["Present", "Absent"],
      colors: ["#10B981", "#EF4444"],
    },
    series: [92, 8],
  };

  return (
    <div className="p-4 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text animate-fade-in">
          Student Dashboard
        </h1>
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative">
            <div
              className="h-32 w-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor})`,
              }}
            />
            <Avatar className="absolute top-16 left-6 w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt={studentName}
              />
              <AvatarFallback className="bg-secondary text-background text-2xl">
                {student.first_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="pt-20">
            <CardTitle className="text-2xl font-semibold text-text">
              {studentName}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-text mb-1">Grade:</p>
              <p className="text-lg text-muted-foreground mb-4">{student.grade_id}</p>
              <p className="font-medium text-text mb-1">Level:</p>
              <p className="text-lg text-muted-foreground mb-4">{student.level_id}</p>

              <p className="font-medium text-text mb-1">Email:</p>
              <p className="text-lg text-muted-foreground mb-4">{student.email}</p>

              <p className="font-medium text-text mb-1">Parent:</p>
              <p className="text-lg text-muted-foreground mb-4">{parentName}</p>
            </div>

            <div className="rounded-lg p-4 border border-border">
              <h3 className="text-lg font-semibold mb-2">Attendance</h3>
              <Chart options={attendanceChart.options} series={attendanceChart.series} type="donut" height={250} />
            </div>
          </CardContent>

          <CardContent>
            <div className="rounded-lg border border-border p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Academic Performance</h3>
              <Chart options={performanceChart.options} series={performanceChart.series} type="bar" height={300} />
            </div>

            <div className="flex justify-end mt-6">
              <ShadcnButton
                onClick={() => router.push("/admin_test/students")}
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