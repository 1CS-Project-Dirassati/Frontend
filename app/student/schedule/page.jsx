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

export default function StudentSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [week, setWeek] = useState(1);
  const [language, setLanguage] = useState("ar"); // Default: Arabic
  const [studentInfo, setStudentInfo] = useState(null);

  const token = useSelector((state) => state.auth.accessToken);
  console.log('tttttttttttt')

  var userId=null

  // Fetch student info and their group
  useEffect(() => {
    const fetchStudentInfo = async () => {
      console.log('xxxxxxxxx')
      console.log(token)
      if (!token ) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `/api/students/`,
          null,
          { token }
        );
        console.log("fetching student info");
        console.log(response);


        if (response) {
          userId = response.students[0].id
          
          console.log(userId)
          console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
          setStudentInfo(response.students[0]);
        } else {
          setError("Failed to fetch student information");
          message.error("Failed to fetch student information");

        }
      } catch (error) {
        console.error("Error fetching student info:", error);
        setError(error.message);
        message.error("Error loading student information");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, [token, userId]);

  // Fetch sessions when student info is available
  useEffect(() => {
    console.log("mmmmmmmmmmmmmmmmm")
    const fetchSessions = async () => {
      if (!token || !studentInfo) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `api/sessions/?week=${week}&group_id=${studentInfo.group_id}`,
          null,
          { token }
        );
        console.log("fetching sessions");
        console.log(response);

        if (response.status && response.sessions) {
          // Transform the sessions data for display
          const formattedSessions = response.sessions.map(session => {
            const { day, time, endTime } = parseTimeSlot(session.time_slot);
            return {
              id: session.id,
              day,
              time: normalizeTime(time),
              endTime: normalizeTime(endTime),
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
  }, [token, studentInfo, week]);

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
      title: "جدول الدروس",
      cardTitle: "الجدول الأسبوعي",
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
      title: "Emploi du temps",
      cardTitle: "Emploi du temps hebdomadaire",
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
    }
  };

  const t = translations[language];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return (
      <div className="p-4">
        <div className="text-red-500">{t.unauthorized}</div>
        <div>{error}</div>

      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="flex gap-4">
          <Select
            value={week.toString()}
            onValueChange={(value) => setWeek(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  Week {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === "ar" ? "fr" : "ar")}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {t.toggleLanguage}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.timeLabel}</TableHead>
                {FIXED_DAYS.map((day) => (
                  <TableHead key={day}>{t.days[FIXED_DAYS.indexOf(day)]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSource.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{`${row.time} - ${row.endTime}`}</TableCell>
                  {FIXED_DAYS.map((day) => (
                    <TableCell key={day}>{row[day]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
