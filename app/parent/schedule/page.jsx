"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Calendar, Globe } from "lucide-react";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import { message, Spin } from "antd";

// Define fixed time slots with normalized times
const FIXED_TIME_SLOTS = [
  { time: '08:00', endTime: '10:00' },
  { time: '10:00', endTime: '12:00' },
  { time: '14:00', endTime: '16:00' }
];

// Define fixed days
const FIXED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper function to normalize time format (e.g., "8:00" to "08:00")
const normalizeTime = (time) => {
  return time.padStart(5, '0'); // This will convert "8:00" to "08:00"
};

// Helper function to parse time slot (e.g., "d3h8-10" to day and time)
const parseTimeSlot = (timeSlot) => {
  const [dayPart, timePart] = timeSlot.split('h');
  const day = parseInt(dayPart.replace('d', ''));
  const [start, end] = timePart.split('-').map(t => normalizeTime(`${t}:00`));
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return {
    day: days[day - 1],
    time: start,
    endTime: end
  };
};

export default function ParentSchedule() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [week, setWeek] = useState(1);
  const [language, setLanguage] = useState("ar"); // Default: Arabic


  const token = useSelector((state) => state.auth.accessToken);
  const parentId = useSelector((state) => state.userinfo.userProfile.id);
  const parentRole = useSelector((state) => state.userinfo.userProfile.role);

  // Fetch parent's children
  useEffect(() => {
    const fetchStudents = async () => {
      console.log("fetching students")
      console.log(token, parentId)
      if (!token || !parentId) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `/api/students/`,
          null,
          { token }
        );
        console.log("response", response)

        
        if (response && Array.isArray(response.students)) {
          setStudents(response.students);
          // Set the first student as default if available
          console.log('xxxxxxxxxxxwwwwwwwwwwww')
          console.log("response.students", response.students)
          if (response.students.length > 0) {
            setSelectedStudent(response.students[0]);
          }
        } else {
          setError("Failed to fetch students");
          message.error("Failed to fetch students");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(error.message);
        message.error("Error loading students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, parentId]);

  // Fetch sessions when student is selected
  useEffect(() => {
    const fetchSessions = async () => {
      if (!token || !selectedStudent) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `api/sessions/?week=${week}&group_id=${selectedStudent.group_id}`,
          null,
          { token }
        );

        if (response.status && response.sessions) {
          // Transform the sessions data for display
          const formattedSessions = response.sessions.map(session => {
            const { day, time, endTime } = parseTimeSlot(session.time_slot);
            return {
              id: session.id,
              day,
              time: normalizeTime(time), // Normalize the time format
              endTime: normalizeTime(endTime), // Normalize the end time format
              subject: session.module_name,
              teacher: session.teacher_name,
              room: session.salle_name,
              groupId: session.group_id,
              groupName: session.group_name,
              semesterName: session.semester_name,
              semesterIndex: session.semester_index
            };
          });

          // Sort sessions by day and time for consistent display
          formattedSessions.sort((a, b) => {
            const dayOrder = FIXED_DAYS.indexOf(a.day) - FIXED_DAYS.indexOf(b.day);
            if (dayOrder !== 0) return dayOrder;
            return a.time.localeCompare(b.time);
          });

          console.log("Formatted sessions:", formattedSessions);
          setSessions(formattedSessions);
        } else {
          setError("Failed to fetch sessions");
          message.error("Failed to fetch sessions");
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setError(error.message);
        message.error("Error loading schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token, selectedStudent, week]);

  // Build table columns with fixed days
  const columns = [
    { 
      title: "Time", 
      dataIndex: "time", 
      key: "time",
      render: (time, record) => `${time} - ${record.endTime}`
    },
    ...FIXED_DAYS.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
    }))
  ];

  // Build table data with fixed time slots
  const dataSource = FIXED_TIME_SLOTS.map(slot => {
    const row = { 
      key: slot.time, 
      time: slot.time,
      endTime: slot.endTime
    };
    
    FIXED_DAYS.forEach(day => {
      const session = sessions.find(s => 
        s.day === day && 
        normalizeTime(s.time) === slot.time
      );
      row[day] = session ? (
        <div className="p-2">
          <div className="font-semibold text-primary">{session.subject}</div>
          <div className="text-sm text-gray-600">Teacher: {session.teacher}</div>
          <div className="text-sm text-gray-500">Room: {session.room}</div>
        </div>
      ) : (
        <div className="p-2 text-gray-300">-</div>
      );
    });
    return row;
  });

  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  // Translations
  const translations = {
    ar: {
      unauthorized: "غير مصرح لك بالوصول إلى هذه الصفحة",
      loading: "جارٍ التحميل...",
      title: (name) => `جدول ${name}`,
      cardTitle: "الجدول الأسبوعي",
      selectChild: "اختر الطالب",
      days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      subjects: {
        العربية: "العربية",
        رياضيات: "رياضيات",
        فرنسية: "فرنسية",
        علوم: "علوم",
        تاريخ: "تاريخ",
        إنجليزية: "إنجليزية",
      },
      noSession: "لا يوجد حصة",
      timeLabel: "الوقت",
      toggleLanguage: "Français",
    },
    fr: {
      unauthorized: "Vous n'êtes pas autorisé à accéder à cette page",
      loading: "Chargement...",
      title: (name) => `Emploi du temps de ${name}`,
      cardTitle: "Emploi du temps hebdomadaire",
      selectChild: "Sélectionner l'élève",
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"],
      subjects: {
        العربية: "Arabe",
        رياضيات: "Mathématiques",
        فرنسية: "Français",
        علوم: "Sciences",
        تاريخ: "Histoire",
        إنجليزية: "Anglais",
      },
      noSession: "Aucune session",
      timeLabel: "Heure",
      toggleLanguage: "العربية",
    },
  };

  // Check parent access and set default child
  useEffect(() => {
    console.log("parentId", parentId)
    if (parentId && parentRole !== "parent") {
      alert(translations[language].unauthorized);
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [parentId, language]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "fr" : "ar");
  };

  if (loading && !selectedStudent) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="text-center">
          <h2 className="text-red-500">Error loading schedule</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="p-4 min-h-screen bg-gradient-to-b from-beige-100 to-slate-200"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-slate-800 text-center"
          >
            {translations[language].title(
              `${selectedStudent?.first_name} ${selectedStudent?.last_name}`
            )}
          </motion.h1>
          <div className="flex items-center gap-4">
            <Select
              value={selectedStudent?.id?.toString()}
              onValueChange={(value) => setSelectedStudent(students.find(s => s.id.toString() === value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={translations[language].selectChild} />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.first_name} {student.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={week.toString()}
              onValueChange={(value) => setWeek(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map(w => (
                  <SelectItem key={w} value={w.toString()}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={toggleLanguage}
              className="bg-slate-600 hover:bg-slate-700 text-white flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              {translations[language].toggleLanguage}
            </Button>
          </div>
        </div>
        <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-slate-600" />
              {translations[language].cardTitle} - {selectedStudent?.group_name}
            </CardTitle>
            {selectedStudent && sessions.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                {sessions[0].semesterName} (Semester {sessions[0].semesterIndex})
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-200">
                    <TableHead
                      className={`w-24 font-semibold text-slate-800 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {translations[language].timeLabel}
                    </TableHead>
                    {translations[language].days.map((day) => (
                      <TableHead
                        key={day}
                        className="text-center text-slate-800 font-semibold"
                      >
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSource.map((row) => (
                    <TableRow
                      key={row.key}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell
                        className={`font-semibold text-slate-800 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {row.time} - {row.endTime}
                      </TableCell>
                      {FIXED_DAYS.map((day) => {
                        const session = sessions.find(s => s.day === day && s.time === row.time);
                        return (
                        <TableCell
                            key={`${row.key}-${day}`}
                          className={`p-2 ${
                              session ? "bg-slate-500" : "bg-slate-100"
                          } text-white`}
                        >
                            {session ? (
                            <div>
                              <p className="font-semibold">
                                  {session.subject}
                              </p>
                              <p className="text-sm">
                                  {session.teacher}
                              </p>
                              <p className="text-sm">
                                  {session.room}
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-center">
                              {translations[language].noSession}
                            </p>
                          )}
                        </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
