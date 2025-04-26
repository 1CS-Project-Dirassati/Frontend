
"use client";

import { useState } from "react";
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
import { Calendar, Globe } from "lucide-react";

export default function StudentSchedule() {
  const [language, setLanguage] = useState("ar"); // Default to Arabic
  const groupName = "3أ"; // Sample group name
  const sampleScheduleData = {
    "الأحد": {
      "08:00": { subject: "العربية", teacher: "فاطمة حداد", room: "Room A-101" },
      "09:00": { subject: "رياضيات", teacher: "ياسين صغير", room: "Room A-102" },
      "10:00": { subject: "فرنسية", teacher: "خديجة بن عمر", room: "Room A-103" },
      "11:00": { subject: "تربية إسلامية", teacher: "مريم عبد الرحمن", room: "Room A-104" },
      "13:00": { subject: "علوم", teacher: "محمد خروبي", room: "Room F-601" },
      "14:00": { subject: "إنجليزية", teacher: "ليلى بوزيان", room: "Room F-602" },
      "15:00": { subject: "تاريخ", teacher: "نسرين عبدون", room: "Room F-603" },
      "16:00": { subject: "جغرافيا", teacher: "أحمد لعمري", room: "Room F-604" },
    },
    "الإثنين": {
      "08:00": { subject: "رياضيات", teacher: "ياسين صغير", room: "Room B-201" },
      "09:00": { subject: "تربية مدنية", teacher: "عبد القادر بلعيد", room: "Room B-202" },
      "10:00": { subject: "العربية", teacher: "فاطمة حداد", room: "Room B-203" },
      "11:00": { subject: "فرنسية", teacher: "خديجة بن عمر", room: "Room B-204" },
      "13:00": { subject: "تاريخ", teacher: "نسرين عبدون", room: "Room G-701" },
      "14:00": { subject: "علوم", teacher: "محمد خروبي", room: "Room G-702" },
      "15:00": { subject: "إنجليزية", teacher: "ليلى بوزيان", room: "Room G-703" },
      "16:00": { subject: "تربية إسلامية", teacher: "مريم عبد الرحمن", room: "Room G-704" },
    },
    "الثلاثاء": {
      "08:00": { subject: "فرنسية", teacher: "خديجة بن عمر", room: "Room C-301" },
      "09:00": { subject: "العربية", teacher: "فاطمة حداد", room: "Room C-302" },
      "10:00": { subject: "تربية إسلامية", teacher: "مريم عبد الرحمن", room: "Room C-303" },
      "11:00": { subject: "رياضيات", teacher: "ياسين صغير", room: "Room C-304" },
      "13:00": { subject: "جغرافيا", teacher: "أحمد لعمري", room: "Room H-801" },
      "14:00": { subject: "إنجليزية", teacher: "ليلى بوزيان", room: "Room H-802" },
      "15:00": { subject: "علوم", teacher: "محمد خروبي", room: "Room H-803" },
      "16:00": { subject: "تاريخ", teacher: "نسرين عبدون", room: "Room H-804" },
    },
    "الأربعاء": {
      "08:00": { subject: "تربية مدنية", teacher: "عبد القادر بلعيد", room: "Room D-401" },
      "09:00": { subject: "فرنسية", teacher: "خديجة بن عمر", room: "Room D-402" },
      "10:00": { subject: "رياضيات", teacher: "ياسين صغير", room: "Room D-403" },
      "11:00": { subject: "العربية", teacher: "فاطمة حداد", room: "Room D-404" },
      "13:00": { subject: "إنجليزية", teacher: "ليلى بوزيان", room: "Room I-901" },
      "14:00": { subject: "تاريخ", teacher: "نسرين عبدون", room: "Room I-902" },
      "15:00": { subject: "جغرافيا", teacher: "أحمد لعمري", room: "Room I-903" },
      "16:00": { subject: "علوم", teacher: "محمد خروبي", room: "Room I-904" },
    },
    "الخميس": {
      "08:00": { subject: "العربية", teacher: "فاطمة حداد", room: "Room E-501" },
      "09:00": { subject: "تربية إسلامية", teacher: "مريم عبد الرحمن", room: "Room E-502" },
      "10:00": { subject: "فرنسية", teacher: "خديجة بن عمر", room: "Room E-503" },
      "11:00": { subject: "رياضيات", teacher: "ياسين صغير", room: "Room E-504" },
      "13:00": { subject: "علوم", teacher: "محمد خروبي", room: "Room J-1001" },
      "14:00": { subject: "جغرافيا", teacher: "أحمد لعمري", room: "Room J-1002" },
      "15:00": { subject: "إنجليزية", teacher: "ليلى بوزيان", room: "Room J-1003" },
      "16:00": { subject: "تاريخ", teacher: "نسرين عبدون", room: "Room J-1004" },
    },
  };

  const translations = {
    ar: {
      title: (group) => `جدول دراسي - ${group}`,
      cardTitle: "جدول الأسبوع",
      days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      subjects: {
        العربية: "العربية",
        رياضيات: "رياضيات",
        فرنسية: "فرنسية",
        "تربية إسلامية": "تربية إسلامية",
        "تربية مدنية": "تربية مدنية",
        علوم: "علوم",
        تاريخ: "تاريخ",
        جغرافيا: "جغرافيا",
        إنجليزية: "إنجليزية",
        فيزياء: "فيزياء",
        كيمياء: "كيمياء",
        أحياء: "أحياء",
        فلسفة: "فلسفة",
      },
      noSession: "لا يوجد حصة",
      timeLabel: "الوقت",
      toggleLanguage: "الفرنسية",
    },
    fr: {
      title: (group) => `Emploi du temps - ${group}`,
      cardTitle: "Emploi du temps hebdomadaire",
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"],
      subjects: {
        العربية: "Arabe",
        رياضيات: "Mathématiques",
        فرنسية: "Français",
        "تربية إسلامية": "Éducation islamique",
        "تربية مدنية": "Éducation civique",
        علوم: "Sciences",
        تاريخ: "Histoire",
        جغرافيا: "Géographie",
        إنجليزية: "Anglais",
        فيزياء: "Physique",
        كيمياء: "Chimie",
        أحياء: "Biologie",
        فلسفة: "Philosophie",
      },
      noSession: "Aucune session",
      timeLabel: "Heure",
      toggleLanguage: "Arabe",
    },
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "fr" : "ar");
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
  const subjectColors = {
    العربية: "bg-blue-300",
    رياضيات: "bg-green-300",
    فرنسية: "bg-purple-300",
    "تربية إسلامية": "bg-orange-300",
    "تربية مدنية": "bg-pink-300",
    علوم: "bg-teal-300",
    تاريخ: "bg-yellow-300",
    جغرافيا: "bg-indigo-300",
    إنجليزية: "bg-red-300",
    فيزياء: "bg-cyan-300",
    كيمياء: "bg-rose-300",
    أحياء: "bg-lime-300",
    فلسفة: "bg-violet-300",
  };

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
            {translations[language].title(groupName)}
          </motion.h1>
          <Button
            onClick={toggleLanguage}
            className="bg-slate-600 hover:bg-slate-700 text-white flex items-center gap-2"
          >
            <Globe className="w-5 h-5" />
            {translations[language].toggleLanguage}
          </Button>
        </div>
        <Card className="bg-white/90 border-slate-300 shadow-2xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2 text-2xl">
              <Calendar className="w-6 h-6 text-slate-600" />
              {translations[language].cardTitle}
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
                        <TableCell key={`${hour}-${day}`} className="p-2">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-lg min-h-[100px] ${
                              sampleScheduleData[translations.ar.days[index]]?.[
                                hour
                              ]
                                ? subjectColors[
                                    sampleScheduleData[
                                      translations.ar.days[index]
                                    ][hour].subject
                                  ] || "bg-slate-500"
                                : "bg-slate-100"
                            } text-white shadow-md`}
                          >
                            {sampleScheduleData[translations.ar.days[index]]?.[
                              hour
                            ] ? (
                              <div>
                                <p className="font-semibold text-lg">
                                  {
                                    translations[language].subjects[
                                      sampleScheduleData[
                                        translations.ar.days[index]
                                      ][hour].subject
                                    ]
                                  }
                                </p>
                                <p className="text-sm">
                                  {
                                    sampleScheduleData[
                                      translations.ar.days[index]
                                    ][hour].teacher
                                  }
                                </p>
                                <p className="text-sm">
                                  {
                                    sampleScheduleData[
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
                          </motion.div>
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
