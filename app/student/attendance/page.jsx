"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Download, Users, CheckCircle2 } from "lucide-react";
import { students } from "../data/studentsData";

// Define Levels and Groups as provided
const levels = [
  { id: 1, name: "السنة الأولى ابتدائي" }, // Year 1 Primary
  { id: 2, name: "السنة الثانية ابتدائي" }, // Year 2 Primary
  { id: 3, name: "السنة الثالثة ابتدائي" }, // Year 3 Primary
  { id: 4, name: "السنة الرابعة ابتدائي" }, // Year 4 Primary
  { id: 5, name: "السنة الخامسة ابتدائي" }, // Year 5 Primary
  { id: 6, name: "السنة الأولى متوسط" }, // Year 1 Middle
  { id: 7, name: "السنة الثانية متوسط" }, // Year 2 Middle
  { id: 8, name: "السنة الثالثة متوسط" }, // Year 3 Middle
  { id: 9, name: "السنة الرابعة متوسط" }, // Year 4 Middle
  { id: 10, name: "السنة الأولى ثانوي" }, // Year 1 Secondary
  { id: 11, name: "السنة الثانية ثانوي" }, // Year 2 Secondary
  { id: 12, name: "السنة الثالثة ثانوي" }, // Year 3 Secondary
];

const groups = [
  { id: 1, name: "1A", level_id: 1, teacher_id: 1 }, // Year 1 Primary, Class A
  { id: 2, name: "1B", level_id: 1, teacher_id: 2 },
  { id: 3, name: "2A", level_id: 2, teacher_id: 3 },
  { id: 4, name: "2B", level_id: 2, teacher_id: 4 },
  { id: 5, name: "6A", level_id: 6, teacher_id: 5 }, // Year 1 Middle, Class A
  { id: 6, name: "6B", level_id: 6, teacher_id: 6 },
  { id: 7, name: "10A", level_id: 10, teacher_id: 7 }, // Year 1 Secondary, Class A
  { id: 8, name: "10B", level_id: 10, teacher_id: 8 },
  { id: 9, name: "12A", level_id: 12, teacher_id: null }, // Year 3 Secondary, no teacher
  { id: 10, name: "12B", level_id: 12, teacher_id: 9 },
];

export default function Attendance() {
  const [level, setLevel] = useState("السنة الأولى ابتدائي");
  const [group, setGroup] = useState("1A");
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize attendance for today if not set
  useEffect(() => {
    const todayKey = format(date, "yyyy-MM-dd");
    if (!attendance[todayKey]) {
      const initialAttendance = students.reduce((acc, student) => {
        acc[student.id] = { present: true, date: todayKey };
        return acc;
      }, {});
      setAttendance((prev) => ({ ...prev, [todayKey]: initialAttendance }));
    }
  }, [date, attendance]);

  // Filter students by level and group
  const filteredStudents = students.filter(
    (student) =>
      levels.find((levelItem) => levelItem.name === level)?.id ===
        student.level_id &&
      groups.find((groupItem) => groupItem.name === group)?.id ===
        student.group_id &&
      student.is_active
  );

  const todayKey = format(date, "yyyy-MM-dd");
  const attendanceToday = attendance[todayKey] || {};
  const presentCount = filteredStudents.filter(
    (student) => attendanceToday[student.id]?.present
  ).length;
  const attendanceRate = (presentCount / filteredStudents.length) * 100 || 0;

  // Toggle attendance
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [todayKey]: {
        ...prev[todayKey],
        [studentId]: {
          ...prev[todayKey][studentId],
          present: !prev[todayKey][studentId]?.present,
        },
      },
    }));
  };

  // Bulk actions
  const markAllPresent = () => {
    const updated = filteredStudents.reduce((acc, student) => {
      acc[student.id] = { present: true, date: todayKey };
      return acc;
    }, {});
    setAttendance((prev) => ({ ...prev, [todayKey]: updated }));
  };

  const markAllAbsent = () => {
    const updated = filteredStudents.reduce((acc, student) => {
      acc[student.id] = { present: false, date: todayKey };
      return acc;
    }, {});
    setAttendance((prev) => ({ ...prev, [todayKey]: updated }));
  };

  const markSelected = (status) => {
    const updated = { ...attendanceToday };
    selectedStudents.forEach((id) => {
      updated[id] = { present: status, date: todayKey };
    });
    setAttendance((prev) => ({ ...prev, [todayKey]: updated }));
    setSelectedStudents([]);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Student ID", "Name", "Level", "Group", "Status", "Date"];
    const rows = filteredStudents.map((student) => [
      student.id,
      `${student.first_name} ${student.last_name}`,
      levels.find((levelItem) => levelItem.id === student.level_id)?.name,
      groups.find((groupItem) => groupItem.id === student.group_id)?.name,
      attendanceToday[student.id]?.present ? "Present" : "Absent",
      todayKey,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${level}_${group}_${todayKey}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Animation for 100% attendance
  const isPerfectAttendance =
    attendanceRate === 100 && filteredStudents.length > 0;

  return (
    <div className="p-4 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text animate-fade-in">
            Class Attendance
          </h1>
          <div className="text-text text-lg font-semibold animate-pulse">
            {format(currentTime, "PPPP, h:mm:ss a")}
          </div>
        </div>

        <Tabs defaultValue="mark" className="space-y-6">
          <TabsList className="bg-secondary/10">
            <TabsTrigger
              value="mark"
              className="data-[state=active]:bg-secondary data-[state=active]:text-background"
            >
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-secondary data-[state=active]:text-background"
            >
              Attendance History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mark">
            <Card className="bg-background border-border shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-text flex items-center gap-2">
                  <Users className="w-6 h-6" /> Mark Attendance for {level} -
                  Group {group}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-full sm:w-48 border-border">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((levelItem) => (
                        <SelectItem key={levelItem.id} value={levelItem.name}>
                          {levelItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={group} onValueChange={setGroup}>
                    <SelectTrigger className="w-full sm:w-48 border-border">
                      <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups
                        .filter(
                          (groupItem) =>
                            groupItem.level_id ===
                            levels.find((levelItem) => levelItem.name === level)
                              ?.id
                        )
                        .map((groupItem) => (
                          <SelectItem key={groupItem.id} value={groupItem.name}>
                            {groupItem.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-text" />
                    <span className="text-text">{format(date, "PPPP")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={markAllPresent}
                    className="bg-secondary hover:bg-accent text-background transition-all duration-300"
                  >
                    Mark All Present
                  </Button>
                  <Button
                    onClick={markAllAbsent}
                    className="bg-red-500 hover:bg-red-600 text-background transition-all duration-300"
                  >
                    Mark All Absent
                  </Button>
                  <Button
                    onClick={() => markSelected(true)}
                    disabled={selectedStudents.length === 0}
                    className="bg-green-500 hover:bg-green-600 text-background transition-all duration-300 disabled:opacity-50"
                  >
                    Mark Selected Present
                  </Button>
                  <Button
                    onClick={() => markSelected(false)}
                    disabled={selectedStudents.length === 0}
                    className="bg-red-500 hover:bg-red-600 text-background transition-all duration-300 disabled:opacity-50"
                  >
                    Mark Selected Absent
                  </Button>
                  <Button
                    onClick={exportCSV}
                    className="bg-primary hover:bg-primary/80 text-background transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-text font-semibold">
                      Attendance Rate:
                    </span>
                    <Progress value={attendanceRate} className="w-48 h-2" />
                    <span className="text-text">
                      {attendanceRate.toFixed(1)}%
                    </span>
                    {isPerfectAttendance && (
                      <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce" />
                    )}
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-accent/10">
                        <TableHead className="w-12">
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead className="text-center">
                          Attendance
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const isChecked = attendanceToday[student.id]?.present;

                        return (
                          <TableRow
                            key={student.id}
                            className="hover:bg-accent/5"
                          >
                            <TableCell className="w-12">
                              <Switch
                                checked={isChecked}
                                onCheckedChange={() =>
                                  toggleAttendance(student.id)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>
                              {
                                levels.find(
                                  (levelItem) =>
                                    levelItem.id === student.level_id
                                )?.name
                              }
                            </TableCell>
                            <TableCell>
                              {
                                groups.find(
                                  (groupItem) =>
                                    groupItem.id === student.group_id
                                )?.name
                              }
                            </TableCell>
                            <TableCell className="text-center">
                              {isChecked ? "Present" : "Absent"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
