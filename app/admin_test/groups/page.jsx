"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Users, Plus, Trash2, Edit, Download, Search } from "lucide-react";
import {
  getStudents,
  updateStudent,
  getGroups,
  getLevels,
  getParents,
  getTeachers,
  addGroup,
  deleteStudent,
  addStudent,
} from "@/app/admin_test/data/studentsData";

// Droppable Group Component
const DroppableGroup = ({ id, label, levelName, teacherName, isActive }) => {
  return (
    <div
      className={`p-3 rounded-lg border-2 transition-colors ${
        isActive
          ? "border-primary bg-primary/10"
          : "border-border bg-background-light hover:bg-background-dark"
      } ${id === "new-group" ? "border-dashed" : ""}`}
      style={{ minWidth: "150px" }}
    >
      <p className="font-semibold text-text">{label}</p>
      {levelName && (
        <p className="text-sm text-text-muted">المستوى: {levelName}</p>
      )}
      {teacherName && (
        <p className="text-sm text-text-muted">المعلم: {teacherName}</p>
      )}
    </div>
  );
};

// Sortable Student Component
const SortableStudent = ({
  student,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  isDragging,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: student.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-card rounded-lg shadow-card flex items-center justify-between hover:bg-background-dark transition-colors"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(student.id)}
          className="border-border"
        />
        <Avatar className="w-10 h-10">
          <AvatarImage src="/images/default_profile.png" />
          <AvatarFallback>
            {student.first_name?.[0]}
            {student.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-text">
            {student.first_name} {student.last_name}
          </p>
          <p className="text-sm text-text-muted">{student.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(student)}
          className="text-text-muted hover:text-primary"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(student.id)}
          className="text-text-muted hover:text-error"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Student List Component
const StudentList = ({
  title,
  students,
  onEdit,
  onDelete,
  onSelect,
  bulkSelected,
  activeStudent,
}) => {
  if (!students || !Array.isArray(students)) {
    return (
      <Card className="bg-background-light h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text flex justify-between items-center">
            {title}
            <Badge className="bg-primary text-text-inverted">0 طلاب</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center">لا يوجد طلاب</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-light h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text flex justify-between items-center">
          {title}
          <Badge className="bg-primary text-text-inverted">
            {students.length} {students.length === 1 ? "طالب" : "طلاب"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SortableContext
          items={students.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {students.length ? (
              students.map((student) => (
                <SortableStudent
                  key={student.id}
                  student={student}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelect={onSelect}
                  isSelected={bulkSelected.includes(student.id)}
                  isDragging={activeStudent?.id === student.id}
                />
              ))
            ) : (
              <p className="text-text-muted text-center">لا يوجد طلاب</p>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
};

export default function StudentsGroups() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [levelFilter, setLevelFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
    level_id: "",
    group_id: "",
    parent_id: "",
    date_of_birth: "",
    national_id: "",
    gender: "",
  });
  const [editStudent, setEditStudent] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    level_id: "",
    teacher_id: "",
  });
  const [bulkSelected, setBulkSelected] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [isNewGroupPromptOpen, setIsNewGroupPromptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const loadedStudents = getStudents() || [];
      const loadedGroups = getGroups() || [];
      const loadedLevels = getLevels() || [];
      setStudents(Array.isArray(loadedStudents) ? loadedStudents : []);
      setGroups(Array.isArray(loadedGroups) ? loadedGroups : []);
      setLevels(Array.isArray(loadedLevels) ? loadedLevels : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("فشل تحميل بيانات الطلاب.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    return students.filter((student) => {
      const matchesLevel =
        levelFilter === "All" || student.level_id === Number(levelFilter);
      const matchesSearch =
        student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.national_id?.includes(searchQuery);
      return matchesLevel && matchesSearch && student.is_active !== false;
    });
  }, [students, levelFilter, searchQuery]);

  const groupStudents = useMemo(() => {
    return filteredStudents.filter(
      (s) =>
        s.group_id &&
        (groupFilter === "All" || s.group_id === Number(groupFilter))
    );
  }, [filteredStudents, groupFilter]);

  const unassignedStudents = useMemo(() => {
    return filteredStudents.filter((s) => !s.group_id);
  }, [filteredStudents]);

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const assigned = filteredStudents.filter((s) => s.group_id).length;
    return { total, assigned, unassigned: total - assigned };
  }, [filteredStudents]);

  const addStudentHandler = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "level_id",
      "parent_id",
      "date_of_birth",
      "national_id",
      "gender",
    ];
    for (const field of requiredFields) {
      if (!newStudent[field]?.trim()) {
        alert(
          `يرجى ملء حقل ${
            field === "first_name"
              ? "الاسم الأول"
              : field === "last_name"
              ? "الاسم الأخير"
              : field === "email"
              ? "البريد الإلكتروني"
              : field === "level_id"
              ? "المستوى"
              : field === "parent_id"
              ? "الوالد"
              : field === "date_of_birth"
              ? "تاريخ الميلاد"
              : field === "national_id"
              ? "الرقم الوطني"
              : "الجنس"
          }.`
        );
        setIsSubmitting(false);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      alert("يرجى إدخال بريد إلكتروني صالح.");
      setIsSubmitting(false);
      return;
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(newStudent.date_of_birth)) {
      alert("يرجى إدخال تاريخ ميلاد صالح (YYYY-MM-DD).");
      setIsSubmitting(false);
      return;
    }

    const nationalIdRegex = /^\d{10}$/;
    if (!nationalIdRegex.test(newStudent.national_id)) {
      alert("الرقم الوطني يجب أن يكون 10 أرقام.");
      setIsSubmitting(false);
      return;
    }

    if (!["M", "F"].includes(newStudent.gender)) {
      alert("الجنس يجب أن يكون 'ذكر' أو 'أنثى'.");
      setIsSubmitting(false);
      return;
    }

    const student = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      first_name: newStudent.first_name.trim(),
      last_name: newStudent.last_name.trim(),
      email: newStudent.email.trim(),
      level_id: Number(newStudent.level_id),
      group_id:
        newStudent.group_id === "none" ? null : Number(newStudent.group_id),
      parent_id: Number(newStudent.parent_id),
      is_approved: false,
      docs_url: null,
      is_active: true,
      date_of_birth: newStudent.date_of_birth,
      national_id: newStudent.national_id,
      gender: newStudent.gender,
      enrollment_date: new Date().toISOString().split("T")[0],
    };

    try {
      addStudent(student);
      setStudents(getStudents());
      setNewStudent({
        first_name: "",
        last_name: "",
        email: "",
        level_id: "",
        group_id: "",
        parent_id: "",
        date_of_birth: "",
        national_id: "",
        gender: "",
      });
      setIsAddStudentOpen(false);
      alert("تم إضافة الطالب بنجاح!");
    } catch (error) {
      console.error("Failed to add student:", error);
      alert("فشل إضافة الطالب.");
    } finally {
      setIsSubmitting(false);
    }
  }, [newStudent, isSubmitting]);

  const editStudentGroup = useCallback(() => {
    if (!editStudent || isSubmitting) return;
    setIsSubmitting(true);

    const updates = {
      group_id:
        editStudent.group_id === "none" ? null : Number(editStudent.group_id),
      level_id: Number(editStudent.level_id),
      parent_id: Number(editStudent.parent_id),
    };

    try {
      updateStudent(editStudent.id, updates);
      setStudents(getStudents());
      setEditStudent(null);
      setIsEditStudentOpen(false);
      alert("تم تحديث الطالب بنجاح!");
    } catch (error) {
      console.error("Failed to update student:", error);
      alert("فشل تحديث الطالب.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editStudent, isSubmitting]);

  const handleDeleteStudent = useCallback((id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      deleteStudent(deleteId);
      setStudents(getStudents());
      setBulkSelected((prev) => prev.filter((sid) => sid !== deleteId));
      setIsDeleteOpen(false);
      setDeleteId(null);
      alert("تم حذف الطالب بنجاح!");
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("فشل حذف الطالب.");
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteId, isSubmitting]);

  const addGroupHandler = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      alert("يرجى إدخال اسم المجموعة واختيار مستوى.");
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (groups.some((g) => g.name === trimmedGroupName)) {
      alert("المجموعة موجودة بالفعل.");
      setIsSubmitting(false);
      return;
    }

    const teacher = getTeachers().find(
      (t) => t.id === Number(newGroup.teacher_id)
    );
    if (newGroup.teacher_id && !teacher && newGroup.teacher_id !== "none") {
      alert("المعلم المحدد غير صالح.");
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      alert("المستوى المحدد غير صالح.");
      setIsSubmitting(false);
      return;
    }

    const group = {
      id: Math.max(...groups.map((g) => g.id), 0) + 1,
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

    try {
      addGroup(group);
      setGroups(getGroups());
      if (bulkSelected.length > 0) {
        bulkSelected.forEach((id) => updateStudent(id, { group_id: group.id }));
        setStudents(getStudents());
      }
      setNewGroup({ name: "", level_id: "", teacher_id: "" });
      setBulkSelected([]);
      setIsAddGroupOpen(false);
      alert(`تم إنشاء المجموعة ${trimmedGroupName} بنجاح!`);
    } catch (error) {
      console.error("Failed to add group:", error);
      alert("فشل إنشاء المجموعة.");
    } finally {
      setIsSubmitting(false);
    }
  }, [newGroup, bulkSelected, groups, isSubmitting, levels]);

  const addGroupFromDrag = useCallback(() => {
    if (!activeStudent || isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      alert("يرجى إدخال اسم المجموعة واختيار مستوى.");
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (groups.some((g) => g.name === trimmedGroupName)) {
      alert("المجموعة موجودة بالفعل.");
      setIsSubmitting(false);
      return;
    }

    const teacher = getTeachers().find(
      (t) => t.id === Number(newGroup.teacher_id)
    );
    if (newGroup.teacher_id && !teacher && newGroup.teacher_id !== "none") {
      alert("المعلم المحدد غير صالح.");
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      alert("المستوى المحدد غير صالح.");
      setIsSubmitting(false);
      return;
    }

    const group = {
      id: Math.max(...groups.map((g) => g.id), 0) + 1,
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

    try {
      addGroup(group);
      updateStudent(activeStudent.id, { group_id: group.id });
      setStudents(getStudents());
      setGroups(getGroups());
      setNewGroup({ name: "", level_id: "", teacher_id: "" });
      setIsNewGroupPromptOpen(false);
      setActiveStudent(null);
      alert(`تم إنشاء المجموعة ${trimmedGroupName} بنجاح!`);
    } catch (error) {
      console.error("Failed to add group from drag:", error);
      alert("فشل إنشاء المجموعة.");
    } finally {
      setIsSubmitting(false);
    }
  }, [newGroup, activeStudent, groups, isSubmitting, levels]);

  const handleDragStart = useCallback(
    (event) => {
      const student = students.find((s) => s.id === event.active.id);
      if (student) {
        setActiveStudent(student);
      }
    },
    [students]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) {
        setActiveStudent(null);
        return;
      }
      const student = students.find((s) => s.id === active.id);
      if (!student) {
        setActiveStudent(null);
        return;
      }
      if (over.id === "new-group") {
        setIsNewGroupPromptOpen(true);
        return;
      }
      const targetGroupId =
        over.id === "unassigned" ? null : Number(over.id.split("-")[1]);
      if (
        targetGroupId === null ||
        groups.some((g) => g.id === targetGroupId)
      ) {
        if (student.group_id !== targetGroupId) {
          try {
            updateStudent(student.id, { group_id: targetGroupId });
            setStudents(getStudents());
            alert("تم إعادة تعيين الطالب بنجاح!");
          } catch (error) {
            console.error("Failed to reassign student:", error);
            alert("فشل إعادة تعيين الطالب.");
          }
        }
      }
      setActiveStudent(null);
    },
    [students, groups]
  );

  const toggleSelectStudent = useCallback((id) => {
    setBulkSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];
      console.log("bulkSelected:", newSelected); // Debug
      return newSelected;
    });
  }, []);

  const bulkAssignGroup = useCallback(
    (groupId) => {
      console.log("bulkAssignGroup:", { groupId, bulkSelected, isSubmitting }); // Debug
      if (!bulkSelected.length || isSubmitting) return;
      setIsSubmitting(true);

      const targetGroupId = groupId === "unassigned" ? null : Number(groupId);
      if (
        targetGroupId === null ||
        groups.some((g) => g.id === targetGroupId)
      ) {
        try {
          bulkSelected.forEach((id) =>
            updateStudent(id, { group_id: targetGroupId })
          );
          setStudents(getStudents());
          setBulkSelected([]);
          alert("تم تعيين الطلاب بنجاح!");
        } catch (error) {
          console.error("Failed to bulk assign:", error);
          alert("فشل تعيين الطلاب.");
        }
      } else {
        alert("المجموعة المحددة غير صالحة.");
      }
      setIsSubmitting(false);
    },
    [bulkSelected, isSubmitting, groups]
  );

  const exportCSV = useCallback(() => {
    const headers = [
      "المعرف",
      "الاسم الأول",
      "الاسم الأخير",
      "البريد الإلكتروني",
      "المستوى",
      "المجموعة",
      "بريد الوالد",
      "الموافقة",
      "تاريخ الميلاد",
      "الرقم الوطني",
      "الجنس",
      "تاريخ التسجيل",
    ];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.first_name,
      s.last_name,
      s.email,
      levels.find((l) => l.id === s.level_id)?.name || "N/A",
      groups.find((g) => g.id === s.group_id)?.name || "غير معين",
      getParents().find((p) => p.id === s.parent_id)?.email || "N/A",
      s.is_approved ? "نعم" : "لا",
      s.date_of_birth,
      s.national_id,
      s.gender === "M" ? "ذكر" : "أنثى",
      s.enrollment_date,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_groups.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    alert("تم تصدير CSV بنجاح!");
  }, [filteredStudents, levels, groups]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (isLoading) {
    return <div className="p-6 text-center text-text">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-background font-inter" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6 flex items-center gap-2 animate-fade-in">
          <Users className="w-8 h-8 text-primary" /> مجموعات الطلاب
        </h1>
        {/* Filters */}
        <Card className="mb-6 bg-background-light shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level" className="font-semibold text-text">
                  المستوى
                </Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger
                    id="level"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">جميع المستويات</SelectItem>
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group" className="font-semibold text-text">
                  المجموعة
                </Label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger
                    id="group"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">جميع المجموعات</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search" className="font-semibold text-text">
                  بحث
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد أو الرقم الوطني..."
                    className="pr-10 border-border bg-background-light text-text"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Groups Drop Zones */}
        <Card className="mb-6 bg-background-light shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-text">
              تعيين إلى مجموعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <DroppableGroup
                id="unassigned"
                label="غير معين"
                levelName={null}
                teacherName={null}
              />
              {groups.map((group) => {
                const teacher = getTeachers().find(
                  (t) => t.id === group.teacher_id
                );
                return (
                  <DroppableGroup
                    key={group.id}
                    id={`group-${group.id}`}
                    label={group.name}
                    levelName={
                      levels.find((l) => l.id === group.level_id)?.name || "N/A"
                    }
                    teacherName={
                      teacher
                        ? `${teacher.first_name} ${teacher.last_name}`
                        : "لا يوجد معلم"
                    }
                    isActive={
                      groupFilter !== "All" && group.id === Number(groupFilter)
                    }
                  />
                );
              })}
              <DroppableGroup
                id="new-group"
                label="إنشاء مجموعة جديدة"
                levelName={null}
                teacherName={null}
              />
            </div>
          </CardContent>
        </Card>
        {/* Actions */}
        <Card className="mb-6 bg-background-light shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-primary text-text-inverted hover:bg-primary-light w-full sm:w-auto"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                <Plus className="w-4 h-4 mr-2" /> إضافة طالب
              </Button>
              <Button
                onClick={() => setIsAddGroupOpen(true)}
                className="bg-primary text-text-inverted hover:bg-primary-light w-full sm:w-auto"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                <Plus className="w-4 h-4 mr-2" /> إنشاء مجموعة
              </Button>
              <Select
                onValueChange={bulkAssignGroup}
                disabled={!bulkSelected.length || isSubmitting}
              >
                <SelectTrigger
                  className={`w-full sm:w-48 border-border bg-background-light text-text ${
                    !bulkSelected.length || isSubmitting
                      ? "opacity-50 cursor-default"
                      : "hover:bg-background-dark cursor-pointer"
                  }`}
                >
                  <SelectValue placeholder="تعيين جماعي للمجموعة" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="unassigned">غير معين</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name} (
                      {levels.find((l) => l.id === g.level_id)?.name || "N/A"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={exportCSV}
                className="bg-accent text-text-inverted hover:bg-accent-light w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Download className="w-4 h-4 mr-2" /> تصدير CSV
              </Button>
            </div>
            {bulkSelected.length > 0 && (
              <p className="mt-4 text-sm text-text-muted">
                {bulkSelected.length} طالب
                {bulkSelected.length > 1 ? " تم اختيارهم" : " تم اختياره"}
              </p>
            )}
          </CardContent>
        </Card>
        {/* Stats */}
        <Card
          className="mb-6 bg-background-light shadow-card"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-text-muted">إجمالي الطلاب</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-100">
                <p className="text-2xl font-bold text-primary">
                  {stats.assigned}
                </p>
                <p className="text-text-muted">معينون للمجموعات</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-200">
                <p className="text-2xl font-bold text-primary">
                  {stats.unassigned}
                </p>
                <p className="text-text-muted">غير معينون</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Group */}
            <div>
              <StudentList
                title={
                  groupFilter === "All"
                    ? "جميع الطلاب المعينين"
                    : `${
                        groups.find((g) => g.id === Number(groupFilter))
                          ?.name || "المجموعة"
                      } الطلاب`
                }
                students={groupStudents}
                onEdit={(student) => {
                  setEditStudent(student);
                  setIsEditStudentOpen(true);
                }}
                onDelete={handleDeleteStudent}
                onSelect={toggleSelectStudent}
                bulkSelected={bulkSelected}
                activeStudent={activeStudent}
              />
            </div>
            {/* Unassigned */}
            <div>
              <StudentList
                title="الطلاب غير المعينين"
                students={unassignedStudents}
                onEdit={(student) => {
                  setEditStudent(student);
                  setIsEditStudentOpen(true);
                }}
                onDelete={handleDeleteStudent}
                onSelect={toggleSelectStudent}
                bulkSelected={bulkSelected}
                activeStudent={activeStudent}
              />
            </div>
            {/* Drag Overlay */}
            <DragOverlay>
              {activeStudent && (
                <div className="p-4 bg-card rounded-lg shadow-card opacity-80">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/images/default_profile.png" />
                      <AvatarFallback>
                        {activeStudent.first_name?.[0]}
                        {activeStudent.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-text">
                        {activeStudent.first_name} {activeStudent.last_name}
                      </p>
                      <p className="text-sm text-text-muted">
                        المستوى:{" "}
                        {levels.find((l) => l.id === activeStudent.level_id)
                          ?.name || "N/A"}
                      </p>
                    </div>
                    <Badge
                      className={
                        activeStudent.group_id
                          ? "bg-primary text-text-inverted"
                          : "bg-text-light text-text-inverted"
                      }
                    >
                      {groups.find((g) => g.id === activeStudent.group_id)
                        ?.name || "غير معين"}
                    </Badge>
                  </div>
                </div>
              )}
            </DragOverlay>
          </div>
        </DndContext>
        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                إضافة طالب جديد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first_name" className="text-text">
                  الاسم الأول
                </Label>
                <Input
                  id="first_name"
                  value={newStudent.first_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, first_name: e.target.value })
                  }
                  placeholder="مثال: أمينة"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-text">
                  الاسم الأخير
                </Label>
                <Input
                  id="last_name"
                  value={newStudent.last_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, last_name: e.target.value })
                  }
                  placeholder="مثال: بوشامة"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-text">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  placeholder="مثال: amina@example.dz"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth" className="text-text">
                  تاريخ الميلاد
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newStudent.date_of_birth}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      date_of_birth: e.target.value,
                    })
                  }
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="national_id" className="text-text">
                  الرقم الوطني
                </Label>
                <Input
                  id="national_id"
                  value={newStudent.national_id}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      national_id: e.target.value,
                    })
                  }
                  placeholder="مثال: 1234567890"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-text">
                  الجنس
                </Label>
                <Select
                  value={newStudent.gender}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, gender: value })
                  }
                >
                  <SelectTrigger
                    id="gender"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="M">ذكر</SelectItem>
                    <SelectItem value="F">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level_id" className="text-text">
                  المستوى
                </Label>
                <Select
                  value={newStudent.level_id}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, level_id: value })
                  }
                >
                  <SelectTrigger
                    id="level_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group_id" className="text-text">
                  المجموعة (اختياري)
                </Label>
                <Select
                  value={newStudent.group_id || "none"}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, group_id: value })
                  }
                >
                  <SelectTrigger
                    id="group_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">غير معين</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parent_id" className="text-text">
                  الوالد
                </Label>
                <Select
                  value={newStudent.parent_id}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, parent_id: value })
                  }
                >
                  <SelectTrigger
                    id="parent_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر الوالد" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {getParents().map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.first_name} {p.last_name} ({p.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewStudent({
                    first_name: "",
                    last_name: "",
                    email: "",
                    level_id: "",
                    group_id: "",
                    parent_id: "",
                    date_of_birth: "",
                    national_id: "",
                    gender: "",
                  });
                  setIsAddStudentOpen(false);
                }}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={addStudentHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                إضافة طالب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                تعديل الطالب
              </DialogTitle>
            </DialogHeader>
            {editStudent ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-text">الاسم</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.first_name} {editStudent.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-text">البريد الإلكتروني</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.email}
                  </p>
                </div>
                <div>
                  <Label className="text-text">تاريخ الميلاد</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.date_of_birth}
                  </p>
                </div>
                <div>
                  <Label className="text-text">الرقم الوطني</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.national_id}
                  </p>
                </div>
                <div>
                  <Label className="text-text">الجنس</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.gender === "M" ? "ذكر" : "أنثى"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-level_id" className="text-text">
                    المستوى
                  </Label>
                  <Select
                    value={String(editStudent.level_id || "")}
                    onValueChange={(value) =>
                      setEditStudent({ ...editStudent, level_id: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-level_id"
                      className="border-border bg-background-light text-text"
                    >
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {levels.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-group_id" className="text-text">
                    المجموعة
                  </Label>
                  <Select
                    value={
                      editStudent.group_id
                        ? String(editStudent.group_id)
                        : "none"
                    }
                    onValueChange={(value) =>
                      setEditStudent({ ...editStudent, group_id: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-group_id"
                      className="border-border bg-background-light text-text"
                    >
                      <SelectValue placeholder="اختر المجموعة" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="none">غير معين</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-parent_id" className="text-text">
                    الوالد
                  </Label>
                  <Select
                    value={String(editStudent.parent_id || "")}
                    onValueChange={(value) =>
                      setEditStudent({ ...editStudent, parent_id: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-parent_id"
                      className="border-border bg-background-light text-text"
                    >
                      <SelectValue placeholder="اختر الوالد" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {getParents().map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.first_name} {p.last_name} ({p.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">لا يوجد طالب للتعديل</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditStudentOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={editStudentGroup}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting || !editStudent}
                style={{ backgroundColor: "#0771CB" }}
              >
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Add Group Dialog */}
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                إنشاء مجموعة جديدة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group_name" className="text-text">
                  اسم المجموعة
                </Label>
                <Input
                  id="group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="مثال: مجموعة الرياضيات أ"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="group_level_id" className="text-text">
                  المستوى
                </Label>
                <Select
                  value={newGroup.level_id}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, level_id: value })
                  }
                >
                  <SelectTrigger
                    id="group_level_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teacher_id" className="text-text">
                  المعلم (اختياري)
                </Label>
                <Select
                  value={newGroup.teacher_id || "none"}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, teacher_id: value })
                  }
                >
                  <SelectTrigger
                    id="teacher_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">لا شيء</SelectItem>
                    {getTeachers().map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.first_name} {t.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewGroup({ name: "", level_id: "", teacher_id: "" });
                  setIsAddGroupOpen(false);
                }}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={addGroupHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                إنشاء المجموعة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* New Group Prompt (Drag) */}
        <Dialog
          open={isNewGroupPromptOpen}
          onOpenChange={setIsNewGroupPromptOpen}
        >
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                إنشاء مجموعة جديدة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="drag_group_name" className="text-text">
                  اسم المجموعة
                </Label>
                <Input
                  id="drag_group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="مثال: مجموعة العلوم ب"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="drag_group_level_id" className="text-text">
                  المستوى
                </Label>
                <Select
                  value={newGroup.level_id}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, level_id: value })
                  }
                >
                  <SelectTrigger
                    id="drag_group_level_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="drag_teacher_id" className="text-text">
                  المعلم (اختياري)
                </Label>
                <Select
                  value={newGroup.teacher_id || "none"}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, teacher_id: value })
                  }
                >
                  <SelectTrigger
                    id="drag_teacher_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">لا شيء</SelectItem>
                    {getTeachers().map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.first_name} {t.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewGroup({ name: "", level_id: "", teacher_id: "" });
                  setIsNewGroupPromptOpen(false);
                  setActiveStudent(null);
                }}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={addGroupFromDrag}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                إنشاء وتعيين
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                تأكيد الحذف
              </DialogTitle>
            </DialogHeader>
            <p className="text-text-muted">
              هل أنت متأكد من أنك تريد حذف هذا الطالب؟ لا يمكن التراجع عن هذا
              الإجراء.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-error text-text-inverted hover:bg-error-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#EA5455" }}
              >
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
