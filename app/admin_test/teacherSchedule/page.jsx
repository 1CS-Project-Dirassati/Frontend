
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

export default function TeacherSchedule() {
  const [language, setLanguage] = useState("ar"); // Default to Arabic
  const teacherName = "فاطمة حداد"; // Sample teacher name
  const sampleTeacherScheduleData = {
    "الأحد": {
      "08:00": { subject: "العربية", group: "3أ", room: "Room A-101" },
      "09:00": { subject: "العربية", group: "3ب", room: "Room A-102" },
      "10:00": { subject: "فرنسية", group: "3أ", room: "Room A-103" },
      "11:00": null,
      "13:00": { subject: "العربية", group: "4أ", room: "Room F-601" },
      "14:00": null,
      "15:00": { subject: "فرنسية", group: "4ب", room: "Room F-603" },
      "16:00": null,
    },
    "الإثنين": {
      "08:00": { subject: "العربية", group: "3ب", room: "Room B-201" },
      "09:00": null,
      "10:00": { subject: "العربية", group: "3أ", room: "Room B-203" },
      "11:00": { subject: "فرنسية", group: "3ب", room: "Room B-204" },
      "13:00": null,
      "14:00": { subject: "العربية", group: "4ب", room: "Room G-702" },
      "15:00": { subject: "فرنسية", group: "4أ", room: "Room G-703" },
      "16:00": null,
    },
    "الثلاثاء": {
      "08:00": { subject: "فرنسية", group: "3أ", room: "Room C-301" },
      "09:00": { subject: "العربية", group: "3ب", room: "Room C-302" },
      "10:00": null,
      "11:00": { subject: "العربية", group: "3أ", room: "Room C-304" },
      "13:00": { subject: "فرنسية", group: "4أ", room: "Room H-801" },
      "14:00": null,
      "15:00": { subject: "العربية", group: "4ب", room: "Room H-803" },
      "16:00": null,
    },
    "الأربعاء": {
      "08:00": null,
      "09:00": { subject: "فرنسية", group: "3ب", room: "Room D-402" },
      "10:00": { subject: "العربية", group: "3أ", room: "Room D-403" },
      "11:00": null,
      "13:00": { subject: "العربية", group: "4أ", room: "Room I-901" },
      "14:00": { subject: "فرنسية", group: "4ب", room: "Room I-902" },
      "15:00": null,
      "16:00": { subject: "العربية", group: "4ب", room: "Room I-904" },
    },
    "الخميس": {
      "08:00": { subject: "العربية", group: "3أ", room: "Room E-501" },
      "09:00": null,
      "10:00": { subject: "فرنسية", group: "3ب", room: "Room E-503" },
      "11:00": { subject: "العربية", group: "3ب", room: "Room E-504" },
      "13:00": null,
      "14:00": { subject: "فرنسية", group: "4أ", room: "Room J-1002" },
      "15:00": { subject: "العربية", group: "4أ", room: "Room J-1003" },
      "16:00": null,
    },
  };

  const translations = {
    ar: {
      title: (teacher) => `جدول التدريس - ${teacher}`,
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
      title: (teacher) => `Emploi du temps d'enseignement - ${teacher}`,
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
    العربية: "bg-blue-400",
    رياضيات: "bg-green-400",
    فرنسية: "bg-purple-400",
    "تربية إسلامية": "bg-orange-400",
    "تربية مدنية": "bg-pink-400",
    علوم: "bg-teal-400",
    تاريخ: "bg-yellow-400",
    جغرافيا: "bg-indigo-400",
    إنجليزية: "bg-red-400",
    فيزياء: "bg-cyan-400",
    كيمياء: "bg-rose-400",
    أحياء: "bg-lime-400",
    فلسفة: "bg-violet-400",
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
            {translations[language].title(teacherName)}
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
                              sampleTeacherScheduleData[
                                translations.ar.days[index]
                              ]?.[hour]
                                ? subjectColors[
                                    sampleTeacherScheduleData[
                                      translations.ar.days[index]
                                    ][hour].subject
                                  ] || "bg-slate-500"
                                : "bg-slate-100"
                            } text-white shadow-md`}
                          >
                            {sampleTeacherScheduleData[
                              translations.ar.days[index]
                            ]?.[hour] ? (
                              <div>
                                <p className="font-semibold text-lg">
                                  {
                                    translations[language].subjects[
                                      sampleTeacherScheduleData[
                                        translations.ar.days[index]
                                      ][hour].subject
                                    ]
                                  }
                                </p>
                                <p className="text-sm">
                                  {
                                    sampleTeacherScheduleData[
                                      translations.ar.days[index]
                                    ][hour].group
                                  }
                                </p>
                                <p className="text-sm">
                                  {
                                    sampleTeacherScheduleData[
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
