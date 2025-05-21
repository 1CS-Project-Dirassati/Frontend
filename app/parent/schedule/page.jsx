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

export default function ParentSchedule({ user }) {
  const [language, setLanguage] = useState("ar"); // Default: Arabic
  const [selectedChild, setSelectedChild] = useState("s1"); // Default: Amina
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded students
  const students = [
    { id: "s1", first_name: "Amina", last_name: "Bouchama", groupId: "1" }, // Group 3أ
    { id: "s2", first_name: "Youssef", last_name: "Bouchama", groupId: "2" }, // Group 3ب
  ];

  // Hardcoded groups
  const groups = [
    { id: "1", name: "3أ" },
    { id: "2", name: "3ب" },
  ];

  // Hardcoded teachers
  const teachers = [
    { id: "1", name: "فاطمة حداد" },
    { id: "2", name: "ياسين صغير" },
    { id: "3", name: "خديجة بن عمر" },
    { id: "4", name: "محمد خروبي" },
    { id: "5", name: "ليلى بوزيان" },
  ];

  // Hardcoded timetables
  const timetables = {
    1: {
      الأحد: {
        "08:00": {
          id: "1",
          subject: "العربية",
          teacher: "فاطمة حداد",
          room: "قاعة أ-101",
          groupId: "1",
        },
        "09:00": {
          id: "2",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة أ-102",
          groupId: "1",
        },
        "10:00": null,
        "11:00": {
          id: "3",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة أ-103",
          groupId: "1",
        },
        "13:00": null,
        "14:00": {
          id: "4",
          subject: "إنجليزية",
          teacher: "ليلى بوزيان",
          room: "قاعة أ-104",
          groupId: "1",
        },
        "15:00": null,
        "16:00": null,
      },
      الإثنين: {
        "08:00": null,
        "09:00": {
          id: "5",
          subject: "فرنسية",
          teacher: "خديجة بن عمر",
          room: "قاعة أ-101",
          groupId: "1",
        },
        "10:00": {
          id: "6",
          subject: "تاريخ",
          teacher: "فاطمة حداد",
          room: "قاعة أ-102",
          groupId: "1",
        },
        "11:00": null,
        "13:00": {
          id: "7",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة أ-103",
          groupId: "1",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الثلاثاء: {
        "08:00": {
          id: "8",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة أ-101",
          groupId: "1",
        },
        "09:00": null,
        "10:00": {
          id: "9",
          subject: "العربية",
          teacher: "فاطمة حداد",
          room: "قاعة أ-102",
          groupId: "1",
        },
        "11:00": null,
        "13:00": {
          id: "10",
          subject: "إنجليزية",
          teacher: "ليلى بوزيان",
          room: "قاعة أ-103",
          groupId: "1",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الأربعاء: {
        "08:00": null,
        "09:00": {
          id: "11",
          subject: "فرنسية",
          teacher: "خديجة بن عمر",
          room: "قاعة أ-101",
          groupId: "1",
        },
        "10:00": null,
        "11:00": {
          id: "12",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة أ-102",
          groupId: "1",
        },
        "13:00": null,
        "14:00": {
          id: "13",
          subject: "تاريخ",
          teacher: "فاطمة حداد",
          room: "قاعة أ-103",
          groupId: "1",
        },
        "15:00": null,
        "16:00": null,
      },
      الخميس: {
        "08:00": {
          id: "14",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة أ-101",
          groupId: "1",
        },
        "09:00": null,
        "10:00": {
          id: "15",
          subject: "إنجليزية",
          teacher: "ليلى بوزيان",
          room: "قاعة أ-102",
          groupId: "1",
        },
        "11:00": null,
        "13:00": {
          id: "16",
          subject: "العربية",
          teacher: "فاطمة حداد",
          room: "قاعة أ-103",
          groupId: "1",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
    },
    2: {
      الأحد: {
        "08:00": {
          id: "17",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة ب-201",
          groupId: "2",
        },
        "09:00": null,
        "10:00": {
          id: "18",
          subject: "فرنسية",
          teacher: "خديجة بن عمر",
          room: "قاعة ب-202",
          groupId: "2",
        },
        "11:00": null,
        "13:00": {
          id: "19",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة ب-203",
          groupId: "2",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الإثنين: {
        "08:00": {
          id: "20",
          subject: "إنجليزية",
          teacher: "ليلى بوزيان",
          room: "قاعة ب-201",
          groupId: "2",
        },
        "09:00": {
          id: "21",
          subject: "العربية",
          teacher: "فاطمة حداد",
          room: "قاعة ب-202",
          groupId: "2",
        },
        "10:00": null,
        "11:00": {
          id: "22",
          subject: "تاريخ",
          teacher: "فاطمة حداد",
          room: "قاعة ب-203",
          groupId: "2",
        },
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الثلاثاء: {
        "08:00": null,
        "09:00": {
          id: "23",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة ب-201",
          groupId: "2",
        },
        "10:00": {
          id: "24",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة ب-202",
          groupId: "2",
        },
        "11:00": null,
        "13:00": {
          id: "25",
          subject: "فرنسية",
          teacher: "خديجة بن عمر",
          room: "قاعة ب-203",
          groupId: "2",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الأربعاء: {
        "08:00": {
          id: "26",
          subject: "العربية",
          teacher: "فاطمة حداد",
          room: "قاعة ب-201",
          groupId: "2",
        },
        "09:00": null,
        "10:00": {
          id: "27",
          subject: "إنجليزية",
          teacher: "ليلى بوزيان",
          room: "قاعة ب-202",
          groupId: "2",
        },
        "11:00": null,
        "13:00": {
          id: "28",
          subject: "تاريخ",
          teacher: "فاطمة حداد",
          room: "قاعة ب-203",
          groupId: "2",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      الخميس: {
        "08:00": null,
        "09:00": {
          id: "29",
          subject: "رياضيات",
          teacher: "ياسين صغير",
          room: "قاعة ب-201",
          groupId: "2",
        },
        "10:00": {
          id: "30",
          subject: "فرنسية",
          teacher: "خديجة بن عمر",
          room: "قاعة ب-202",
          groupId: "2",
        },
        "11:00": null,
        "13:00": {
          id: "31",
          subject: "علوم",
          teacher: "محمد خروبي",
          room: "قاعة ب-203",
          groupId: "2",
        },
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
    },
  };

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
      unauthorized: "Vous n’êtes pas autorisé à accéder à cette page",
      loading: "Chargement...",
      title: (name) => `Emploi du temps de ${name}`,
      cardTitle: "Emploi du temps hebdomadaire",
      selectChild: "Sélectionner l’élève",
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

  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  // Subject colors
  const subjectColors = {
    العربية: "bg-blue-600",
    رياضيات: "bg-green-600",
    فرنسية: "bg-purple-600",
    علوم: "bg-teal-600",
    تاريخ: "bg-yellow-600",
    إنجليزية: "bg-red-600",
  };

  // Check parent access and set default child
  useEffect(() => {
    if (user && user.role !== "parent") {
      alert(translations[language].unauthorized);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [user, language]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "fr" : "ar");
  };

  // Get group ID for selected child
  const child = students.find((s) => s.id === selectedChild);
  const groupId = child ? child.groupId : "1";
  const groupName =
    groups.find((g) => g.id === groupId)?.name ||
    translations[language].selectChild;

  if (isLoading || (user && user.role !== "parent")) {
    return (
      <div className="p-6 text-center text-slate-800">
        {translations[language].loading}
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
              `${child?.first_name} ${child?.last_name}`
            )}
          </motion.h1>
          <div className="flex items-center gap-4">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-48 border-slate-300">
                <SelectValue placeholder={translations[language].selectChild} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
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
              {translations[language].cardTitle} - {groupName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {hours.map((hour) => (
                    <TableRow
                      key={hour}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell
                        className={`font-semibold text-slate-800 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {hour}
                      </TableCell>
                      {translations[language].days.map((day, index) => (
                        <TableCell
                          key={`${hour}-${day}`}
                          className={`p-2 ${
                            timetables[groupId]?.[
                              translations.ar.days[index]
                            ]?.[hour]
                              ? subjectColors[
                                  timetables[groupId][
                                    translations.ar.days[index]
                                  ][hour].subject
                                ] || "bg-slate-500"
                              : "bg-slate-100"
                          } text-white`}
                        >
                          {timetables[groupId]?.[translations.ar.days[index]]?.[
                            hour
                          ] ? (
                            <div>
                              <p className="font-semibold">
                                {
                                  translations[language].subjects[
                                    timetables[groupId][
                                      translations.ar.days[index]
                                    ][hour].subject
                                  ]
                                }
                              </p>
                              <p className="text-sm">
                                {
                                  timetables[groupId][
                                    translations.ar.days[index]
                                  ][hour].teacher
                                }
                              </p>
                              <p className="text-sm">
                                {
                                  timetables[groupId][
                                    translations.ar.days[index]
                                  ][hour].room
                                }
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-center">
                              {translations[language].noSession}
                            </p>
                          )}
                        </TableCell>
                      ))}
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
