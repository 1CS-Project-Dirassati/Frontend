
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Plus, Trash2, Globe, Edit } from "lucide-react";

export default function Schedule() {
  const [groupId, setGroupId] = useState("1");
  const [language, setLanguage] = useState("ar");
  const [timetables, setTimetables] = useState({
    "1": {
      "الأحد": {
        "08:00": { id: "1", subject: "العربية", teacher: "فاطمة حداد", room: "قاعة أ-101", groupId: "1" },
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الإثنين": {
        "08:00": null,
        "09:00": { id: "2", subject: "رياضيات", teacher: "ياسين صغير", room: "قاعة أ-102", groupId: "1" },
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الثلاثاء": {
        "08:00": null,
        "09:00": null,
        "10:00": { id: "3", subject: "فرنسية", teacher: "خديجة بن عمر", room: "قاعة أ-103", groupId: "1" },
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الأربعاء": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الخميس": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
    },
    "2": {
      "الأحد": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الإثنين": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الثلاثاء": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الأربعاء": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
      "الخميس": {
        "08:00": null,
        "09:00": null,
        "10:00": null,
        "11:00": null,
        "13:00": null,
        "14:00": null,
        "15:00": null,
        "16:00": null,
      },
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [currentSession, setCurrentSession] = useState({
    day: "",
    hour: "",
    subject: "",
    teacher: "",
    room: "",
    id: "",
  });

  const translations = {
    ar: {
      title: (group) => `إدارة الجدول الزمني - ${group}`,
      cardTitle: "إدارة الجدول الأسبوعي",
      addSession: "إضافة حصة",
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
      dialogTitleAdd: "إضافة حصة جديدة",
      dialogTitleEdit: "تعديل الحصة",
      dayLabel: "اليوم",
      hourLabel: "الساعة",
      subjectLabel: "المادة",
      teacherLabel: "الأستاذ",
      roomLabel: "القاعة",
      cancel: "إلغاء",
      add: "إضافة",
      save: "حفظ",
      delete: "حذف",
      selectGroup: "اختر المجموعة",
      confirmOverwrite: "هذه الخانة تحتوي على حصة. هل تريد استبدالها؟",
    },
    fr: {
      title: (group) => `Gestion de l'emploi du temps - ${group}`,
      cardTitle: "Gestion de l'emploi du temps hebdomadaire",
      addSession: "Ajouter une session",
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
      dialogTitleAdd: "Ajouter une nouvelle session",
      dialogTitleEdit: "Modifier la session",
      dayLabel: "Jour",
      hourLabel: "Heure",
      subjectLabel: "Matière",
      teacherLabel: "Professeur",
      roomLabel: "Salle",
      cancel: "Annuler",
      add: "Ajouter",
      save: "Enregistrer",
      delete: "Supprimer",
      selectGroup: "Sélectionner le groupe",
      confirmOverwrite: "Cette case contient une session. Voulez-vous la remplacer ?",
    },
  };

  const hours = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  // Hardcoded boilerplate data
  const groups = [
    { id: "1", name: "3أ" },
    { id: "2", name: "3ب" },
  ];
  const teachers = [
    { id: "1", name: "فاطمة حداد" },
    { id: "2", name: "ياسين صغير" },
    { id: "3", name: "خديجة بن عمر" },
    { id: "4", name: "محمد خروبي" },
    { id: "5", name: "ليلى بوزيان" },
  ];

  // Initialize timetable for new groups
  useEffect(() => {
    if (!timetables[groupId]) {
      const emptyTimetable = {};
      translations.ar.days.forEach((day) => {
        emptyTimetable[day] = {};
        hours.forEach((hour) => {
          emptyTimetable[day][hour] = null;
        });
      });
      setTimetables((prev) => ({
        ...prev,
        [groupId]: emptyTimetable,
      }));
    }
  }, [groupId]);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "fr" : "ar");
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setCurrentSession({
      day: translations.ar.days[0],
      hour: hours[0],
      subject: "",
      teacher: "",
      room: "",
      id: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (day, hour, session) => {
    setDialogMode("edit");
    setCurrentSession({
      day,
      hour,
      subject: session.subject,
      teacher: session.teacher,
      room: session.room,
      id: session.id,
    });
    setIsDialogOpen(true);
  };

  const saveSession = () => {
    if (!currentSession.day || !currentSession.hour || !currentSession.subject || !currentSession.teacher || !currentSession.room) {
      alert(language === "ar" ? "يرجى ملء جميع الحقول." : "Veuillez remplir tous les champs.");
      return;
    }

    // Check if slot is occupied (for add mode)
    if (dialogMode === "add" && timetables[groupId][currentSession.day][currentSession.hour]) {
      const confirm = window.confirm(translations[language].confirmOverwrite);
      if (!confirm) return;
    }

    const sessionData = {
      id: dialogMode === "edit" ? currentSession.id : `${Date.now()}`,
      subject: currentSession.subject,
      teacher: currentSession.teacher,
      room: currentSession.room,
      groupId,
    };

    setTimetables((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [currentSession.day]: {
          ...prev[groupId][currentSession.day],
          [currentSession.hour]: sessionData,
        },
      },
    }));

    setIsDialogOpen(false);
    setCurrentSession({ day: "", hour: "", subject: "", teacher: "", room: "", id: "" });
  };

  const deleteSession = (day, hour) => {
    setTimetables((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [day]: {
          ...prev[groupId][day],
          [hour]: null,
        },
      },
    }));
    setIsDialogOpen(false);
  };

  const clearHour = (hour) => {
    setTimetables((prev) => {
      const newTimetables = { ...prev };
      Object.keys(newTimetables[groupId]).forEach((day) => {
        newTimetables[groupId][day][hour] = null;
      });
      return newTimetables;
    });
  };

  const groupName = groups.find((g) => g.id === groupId)?.name || translations[language].selectGroup;

  const subjectColors = {
    العربية: "bg-blue-600",
    رياضيات: "bg-green-600",
    فرنسية: "bg-purple-600",
    "تربية إسلامية": "bg-orange-600",
    "تربية مدنية": "bg-pink-600",
    علوم: "bg-teal-600",
    تاريخ: "bg-yellow-600",
    جغرافيا: "bg-indigo-600",
    إنجليزية: "bg-red-600",
    فيزياء: "bg-cyan-600",
    كيمياء: "bg-rose-600",
    أحياء: "bg-lime-600",
    فلسفة: "bg-violet-600",
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
        <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl mb-6">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-slate-600" />
              {translations[language].cardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="w-full sm:w-48 border-slate-300">
                  <SelectValue placeholder={translations[language].selectGroup} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={openAddDialog}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {translations[language].addSession}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-800">{translations[language].cardTitle}</CardTitle>
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
                    <TableHead className="w-24 text-center text-slate-800 font-semibold">
                      {language === "ar" ? "الإجراءات" : "Actions"}
                    </TableHead>
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
                          className={`p-2 cursor-pointer ${timetables[groupId]?.[translations.ar.days[index]]?.[hour] ? subjectColors[timetables[groupId][translations.ar.days[index]][hour].subject] || "bg-slate-500" : "bg-slate-100"} text-white`}
                          onClick={() =>
                            timetables[groupId]?.[translations.ar.days[index]]?.[hour] &&
                            openEditDialog(translations.ar.days[index], hour, timetables[groupId][translations.ar.days[index]][hour])
                          }
                        >
                          {timetables[groupId]?.[translations.ar.days[index]]?.[hour] ? (
                            <div>
                              <p className="font-semibold">{translations[language].subjects[timetables[groupId][translations.ar.days[index]][hour].subject]}</p>
                              <p className="text-sm">{timetables[groupId][translations.ar.days[index]][hour].teacher}</p>
                              <p className="text-sm">{timetables[groupId][translations.ar.days[index]][hour].room}</p>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-center">{translations[language].noSession}</p>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => clearHour(hour)}
                          className="text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white/90 text-slate-800 rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? translations[language].dialogTitleAdd : translations[language].dialogTitleEdit}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-slate-800 font-semibold">
                  {translations[language].dayLabel}
                </label>
                <Select
                  value={currentSession.day}
                  onValueChange={(value) => setCurrentSession({ ...currentSession, day: value })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder={translations[language].dayLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {translations.ar.days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {translations[language].days[translations.ar.days.indexOf(day)]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-800 font-semibold">
                  {translations[language].hourLabel}
                </label>
                <Select
                  value={currentSession.hour}
                  onValueChange={(value) => setCurrentSession({ ...currentSession, hour: value })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder={translations[language].hourLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-800 font-semibold">
                  {translations[language].subjectLabel}
                </label>
                <Select
                  value={currentSession.subject}
                  onValueChange={(value) => setCurrentSession({ ...currentSession, subject: value })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder={translations[language].subjectLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(translations.ar.subjects).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {translations[language].subjects[subject]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-800 font-semibold">
                  {translations[language].teacherLabel}
                </label>
                <Select
                  value={currentSession.teacher}
                  onValueChange={(value) => setCurrentSession({ ...currentSession, teacher: value })}
                >
                  <SelectTrigger className="w-full border-slate-300">
                    <SelectValue placeholder={translations[language].teacherLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.name}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-800 font-semibold">
                  {translations[language].roomLabel}
                </label>
                <input
                  type="text"
                  value={currentSession.room}
                  onChange={(e) => setCurrentSession({ ...currentSession, room: e.target.value })}
                  className="w-full border-slate-300 rounded-md p-2 bg-white text-slate-800"
                  placeholder={language === "ar" ? "مثال: قاعة أ-101" : "Ex. : Salle A-101"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-200"
              >
                {translations[language].cancel}
              </Button>
              {dialogMode === "edit" && (
                <Button
                  variant="destructive"
                  onClick={() => deleteSession(currentSession.day, currentSession.hour)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {translations[language].delete}
                </Button>
              )}
              <Button
                onClick={saveSession}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                {dialogMode === "add" ? translations[language].add : translations[language].save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
