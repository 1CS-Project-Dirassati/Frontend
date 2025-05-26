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
import { message } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

// Translation object for Arabic and French
const translations = {
  ar: {
    title: "مجموعات الطلاب",
    level: "المستوى",
    group: "المجموعة",
    search: "بحث",
    searchPlaceholder: "ابحث بالاسم أو البريد أو الرقم الوطني...",
    assignGroup: "تعيين إلى مجموعة",
    unassigned: "غير معين",
    newGroup: "إنشاء مجموعة جديدة",
    addStudent: "إضافة طالب",
    createGroup: "إنشاء مجموعة",
    bulkAssign: "تعيين جماعي للمجموعة",
    exportCSV: "تصدير CSV",
    totalStudents: "إجمالي الطلاب",
    assignedStudents: "معينون للمجموعات",
    unassignedStudents: "غير معينون",
    allAssignedStudents: "جميع الطلاب المعينين",
    groupStudents: "الطلاب",
    unassignedStudentsTitle: "الطلاب غير المعينين",
    noStudents: "لا يوجد طلاب",
    studentsCount: (count) => `${count} ${count === 1 ? "طالب" : "طلاب"}`,
    selectedStudents: (count) =>
      `${count} طالب${count > 1 ? " تم اختيارهم" : " تم اختياره"}`,
    addStudentTitle: "إضافة طالب جديد",
    editStudentTitle: "تعديل الطالب",
    createGroupTitle: "إنشاء مجموعة جديدة",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    dob: "تاريخ الميلاد",
    nationalId: "الرقم الوطني",
    gender: "الجنس",
    levelSelect: "المستوى",
    groupSelect: "المجموعة (اختياري)",
    parent: "الوالد",
    cancel: "إلغاء",
    addStudentBtn: "إضافة طالب",
    saveChanges: "حفظ التغييرات",
    createGroupBtn: "إنشاء المجموعة",
    createAndAssign: "إنشاء وتعيين",
    deleteConfirmTitle: "تأكيد الحذف",
    deleteConfirmText:
      "هل أنت متأكد من أنك تريد حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.",
    delete: "حذف",
    loading: "جارٍ التحميل...",
    groupName: "اسم المجموعة",
    teacher: "المعلم (اختياري)",
    none: "لا شيء",
    male: "ذكر",
    female: "أنثى",
    namePlaceholder: "مثال: أمينة",
    lastNamePlaceholder: "مثال: بوشامة",
    emailPlaceholder: "مثال: amina@example.dz",
    nationalIdPlaceholder: "مثال: 1234567890",
    groupNamePlaceholder: "مثال: مجموعة الرياضيات أ",
    dragGroupNamePlaceholder: "مثال: مجموعة العلوم ب",
    errors: {
      required: (field) => `يرجى ملء حقل ${field}.`,
      invalidEmail: "يرجى إدخال بريد إلكتروني صالح.",
      invalidDob: "يرجى إدخال تاريخ ميلاد صالح (YYYY-MM-DD).",
      invalidNationalId: "الرقم الوطني يجب أن يكون 10 أرقام.",
      invalidGender: "الجنس يجب أن يكون 'ذكر' أو 'أنثى'.",
      groupExists: "المجموعة موجودة بالفعل.",
      invalidTeacher: "المعلم المحدد غير صالح.",
      invalidLevel: "المستوى المحدد غير صالح.",
      invalidGroup: "المجموعة المحددة غير صالحة.",
      addStudentFailed: "فشل إضافة الطالب.",
      updateStudentFailed: "فشل تحديث الطالب.",
      deleteStudentFailed: "فشل حذف الطالب.",
      addGroupFailed: "فشل إنشاء المجموعة.",
      loadDataFailed: "فشل تحميل بيانات الطلاب.",
      bulkAssignFailed: "فشل تعيين الطلاب.",
    },
    success: {
      addStudent: "تم إضافة الطالب بنجاح!",
      updateStudent: "تم تحديث الطالب بنجاح!",
      deleteStudent: "تم حذف الطالب بنجاح!",
      addGroup: (name) => `تم إنشاء المجموعة ${name} بنجاح!`,
      bulkAssign: "تم تعيين الطلاب بنجاح!",
      exportCSV: "تم تصدير CSV بنجاح!",
    },
  },
  fr: {
    title: "Groupes d'étudiants",
    level: "Niveau",
    group: "Groupe",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par nom, email ou numéro national...",
    assignGroup: "Affecter à un groupe",
    unassigned: "Non affecté",
    newGroup: "Créer un nouveau groupe",
    addStudent: "Ajouter un étudiant",
    createGroup: "Créer un groupe",
    bulkAssign: "Affectation groupée au groupe",
    exportCSV: "Exporter en CSV",
    totalStudents: "Total des étudiants",
    assignedStudents: "Affectés aux groupes",
    unassignedStudents: "Non affectés",
    allAssignedStudents: "Tous les étudiants affectés",
    groupStudents: "Étudiants",
    unassignedStudentsTitle: "Étudiants non affectés",
    noStudents: "Aucun étudiant",
    studentsCount: (count) => `${count} étudiant${count > 1 ? "s" : ""}`,
    selectedStudents: (count) =>
      `${count} étudiant${count > 1 ? "s sélectionnés" : " sélectionné"}`,
    addStudentTitle: "Ajouter un nouvel étudiant",
    editStudentTitle: "Modifier l'étudiant",
    createGroupTitle: "Créer un nouveau groupe",
    firstName: "Prénom",
    lastName: "Nom de famille",
    email: "Email",
    dob: "Date de naissance",
    nationalId: "Numéro national",
    gender: "Genre",
    levelSelect: "Niveau",
    groupSelect: "Groupe (facultatif)",
    parent: "Parent",
    cancel: "Annuler",
    addStudentBtn: "Ajouter l'étudiant",
    saveChanges: "Enregistrer les modifications",
    createGroupBtn: "Créer le groupe",
    createAndAssign: "Créer et affecter",
    deleteConfirmTitle: "Confirmer la suppression",
    deleteConfirmText:
      "Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.",
    delete: "Supprimer",
    loading: "Chargement...",
    groupName: "Nom du groupe",
    teacher: "Enseignant (facultatif)",
    none: "Aucun",
    male: "Homme",
    female: "Femme",
    namePlaceholder: "Exemple : Amina",
    lastNamePlaceholder: "Exemple : Bouchama",
    emailPlaceholder: "Exemple : amina@example.dz",
    nationalIdPlaceholder: "Exemple : 1234567890",
    groupNamePlaceholder: "Exemple : Groupe Mathématiques A",
    dragGroupNamePlaceholder: "Exemple : Groupe Sciences B",
    errors: {
      required: (field) => `Veuillez remplir le champ ${field}.`,
      invalidEmail: "Veuillez entrer un email valide.",
      invalidDob: "Veuillez entrer une date de naissance valide (YYYY-MM-DD).",
      invalidNationalId: "Le numéro national doit comporter 10 chiffres.",
      invalidGender: "Le genre doit être 'Homme' ou 'Femme'.",
      groupExists: "Le groupe existe déjà.",
      invalidTeacher: "L'enseignant sélectionné est invalide.",
      invalidLevel: "Le niveau sélectionné est invalide.",
      invalidGroup: "Le groupe sélectionné est invalide.",
      addStudentFailed: "Échec de l'ajout de l'étudiant.",
      updateStudentFailed: "Échec de la mise à jour de l'étudiant.",
      deleteStudentFailed: "Échec de la suppression de l'étudiant.",
      addGroupFailed: "Échec de la création du groupe.",
      loadDataFailed: "Échec du chargement des données des étudiants.",
      bulkAssignFailed: "Échec de l'affectation des étudiants.",
    },
    success: {
      addStudent: "Étudiant ajouté avec succès !",
      updateStudent: "Étudiant mis à jour avec succès !",
      deleteStudent: "Étudiant supprimé avec succès !",
      addGroup: (name) => `Groupe ${name} créé avec succès !`,
      bulkAssign: "Étudiants affectés avec succès !",
      exportCSV: "Exportation CSV réussie !",
    },
  },
};

// Droppable Group Component
const DroppableGroup = ({ id, label, levelName, teacherName, isActive, t }) => {
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
        <p className="text-sm text-text-muted">
          {t.level}: {levelName}
        </p>
      )}
      {teacherName && (
        <p className="text-sm text-text-muted">
          {t.teacher.replace(" (facultatif)", "")}: {teacherName}
        </p>
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
  t,
}) => {
  if (!students || !Array.isArray(students)) {
    return (
      <Card className="bg-background-light h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text flex justify-between items-center">
            {title}
            <Badge className="bg-primary text-text-inverted">
              {t.studentsCount(0)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center">{t.noStudents}</p>
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
            {t.studentsCount(students.length)}
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
              <p className="text-text-muted text-center">{t.noStudents}</p>
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
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
  const [language, setLanguage] = useState("fr");
  const token = useSelector((state) => state.auth.accessToken);

  // Translation function
  const t = translations[language];

  // Data Fetching and Manipulation Functions
  const getStudents = async () => {
    try {
      const response = await apiCall("get", "/api/students/", null, { token });
      message.success(t.success.loadData);
      return response.students || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const updateStudent = async (id, values) => {
    try {
      console.log(`Updating student ${id} with payload:`, values);
      await apiCall("put", `/api/students/${id}`, values, { token });
      message.success(t.success.updateStudent);
    } catch (err) {
      console.error("Update student error:", err.response || err);
      message.error(err.response?.message || t.errors.updateStudentFailed);
      throw err;
    }
  };

  const getGroups = async () => {
    try {
      const response = await apiCall("get", "/api/groups/", null, { token });
      message.success(t.success.loadData);
      return response.groups || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const getLevels = async () => {
    try {
      const response = await apiCall("get", "/api/levels/", null, { token });
      message.success(t.success.loadData);
      return response.levels || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const getParents = async () => {
    try {
      const response = await apiCall("get", "/api/parents/", null, { token });
      message.success(t.success.loadData);
      return response.parents || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const getTeachers = async () => {
    try {
      const response = await apiCall("get", "/api/teachers/", null, { token });
      message.success(t.success.loadData);
      return response.teachers || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const addGroup = async (groupData) => {
    try {
      console.log("Creating group with payload:", groupData);
      const response = await apiCall("post", "/api/groups/", groupData, {
        token,
      });
      message.success(t.success.addGroup(groupData.name));
      return response; // Return the new group data
    } catch (err) {
      console.error("Add group error:", err.response || err);
      message.error(err.response?.message || t.errors.addGroupFailed);
      throw err;
    }
  };

  const deleteStudent = async (id) => {
    try {
      await apiCall("delete", `/api/students/${id}`, null, { token });
      message.success(t.success.deleteStudent);
    } catch (err) {
      message.error(t.errors.deleteStudentFailed);
      throw err;
    }
  };

  const addStudent = async (studentData) => {
    try {
      await apiCall("post", "/api/students/", studentData, { token });
      message.success(t.success.addStudent);
    } catch (err) {
      message.error(t.errors.addStudentFailed);
      throw err;
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          studentsData,
          groupsData,
          levelsData,
          parentsData,
          teachersData,
        ] = await Promise.all([
          getStudents(),
          getGroups(),
          getLevels(),
          getParents(),
          getTeachers(),
        ]);
        console.log("Fetched Data:", {
          studentsData,
          groupsData,
          levelsData,
          parentsData,
          teachersData,
        });
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setLevels(Array.isArray(levelsData) ? levelsData : []);
        setParents(Array.isArray(parentsData) ? parentsData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        console.error("Failed to load data:", error);
        message.error(t.errors.loadDataFailed);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t]);

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
      { key: "first_name", label: t.firstName },
      { key: "last_name", label: t.lastName },
      { key: "email", label: t.email },
      { key: "level_id", label: t.levelSelect },
      { key: "parent_id", label: t.parent },
      { key: "date_of_birth", label: t.dob },
      { key: "national_id", label: t.nationalId },
      { key: "gender", label: t.gender },
    ];
    for (const field of requiredFields) {
      if (!newStudent[field.key]?.trim()) {
        message.error(t.errors.required(field.label));
        setIsSubmitting(false);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      message.error(t.errors.invalidEmail);
      setIsSubmitting(false);
      return;
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(newStudent.date_of_birth)) {
      message.error(t.errors.invalidDob);
      setIsSubmitting(false);
      return;
    }

    const nationalIdRegex = /^\d{10}$/;
    if (!nationalIdRegex.test(newStudent.national_id)) {
      message.error(t.errors.invalidNationalId);
      setIsSubmitting(false);
      return;
    }

    if (!["M", "F"].includes(newStudent.gender)) {
      message.error(t.errors.invalidGender);
      setIsSubmitting(false);
      return;
    }

    const student = {
      first_name: newStudent.first_name.trim(),
      last_name: newStudent.last_name.trim(),
      email: newStudent.email.trim(),
      level_id: Number(newStudent.level_id),
      group_id:
        newStudent.group_id === "none" ? 0 : Number(newStudent.group_id),
      parent_id: Number(newStudent.parent_id),
      is_approved: false,
      docs_url: "",
      is_active: true,
      date_of_birth: newStudent.date_of_birth,
      national_id: newStudent.national_id,
      gender: newStudent.gender,
      enrollment_date: new Date().toISOString().split("T")[0],
    };

    addStudent(student)
      .then(() => {
        return getStudents();
      })
      .then((updatedStudents) => {
        setStudents(updatedStudents);
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
      })
      .catch((error) => {
        console.error("Failed to add student:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [newStudent, isSubmitting, t]);

  const editStudentGroup = useCallback(() => {
    if (!editStudent || isSubmitting) return;
    setIsSubmitting(true);

    const level = levels.find((l) => l.id === Number(editStudent.level_id));
    if (!level) {
      message.error(t.errors.invalidLevel);
      setIsSubmitting(false);
      return;
    }

    const group =
      editStudent.group_id !== "none"
        ? groups.find((g) => g.id === Number(editStudent.group_id))
        : null;
    if (editStudent.group_id !== "none" && !group) {
      message.error(t.errors.invalidGroup);
      setIsSubmitting(false);
      return;
    }

    const updates = {
      first_name: editStudent.first_name.trim(),
      last_name: editStudent.last_name.trim(),
      level_id: Number(editStudent.level_id),
      group_id:
        editStudent.group_id === "none" ? 0 : Number(editStudent.group_id),
      docs_url: editStudent.docs_url || "",
    };

    console.log("Updating student with payload:", updates);

    updateStudent(editStudent.id, updates)
      .then(() => {
        return getStudents();
      })
      .then((updatedStudents) => {
        setStudents(updatedStudents);
        setEditStudent(null);
        setIsEditStudentOpen(false);
        message.success(t.success.updateStudent);
      })
      .catch((error) => {
        console.error("Failed to update student:", error.response || error);
        message.error(error.response?.message || t.errors.updateStudentFailed);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [editStudent, isSubmitting, levels, groups, t]);

  const handleDeleteStudent = useCallback((id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteId || isSubmitting) return;
    setIsSubmitting(true);

    deleteStudent(deleteId)
      .then(() => {
        return getStudents();
      })
      .then((updatedStudents) => {
        setStudents(updatedStudents);
        setBulkSelected((prev) => prev.filter((sid) => sid !== deleteId));
        setIsDeleteOpen(false);
        setDeleteId(null);
      })
      .catch((error) => {
        console.error("Failed to delete student:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [deleteId, isSubmitting, t]);

  const addGroupHandler = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      message.error(
        t.errors.required(t.groupName) + " " + t.errors.required(t.level)
      );
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (
      groups.some(
        (g) => g.name.toLowerCase() === trimmedGroupName.toLowerCase()
      )
    ) {
      message.error(t.errors.groupExists);
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      message.error(t.errors.invalidLevel);
      setIsSubmitting(false);
      return;
    }

    const teacher =
      newGroup.teacher_id !== "none" &&
      teachers.find((t) => t.id === Number(newGroup.teacher_id));
    if (newGroup.teacher_id !== "none" && !teacher) {
      message.error(t.errors.invalidTeacher);
      setIsSubmitting(false);
      return;
    }

    const group = {
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

    console.log("Creating group with payload:", group);

    addGroup(group)
      .then((newGroupResponse) => {
        setGroups((prev) => [...prev, newGroupResponse]);
        if (bulkSelected.length > 0) {
          return Promise.all(
            bulkSelected.map((id) => {
              const student = students.find((s) => s.id === id);
              return updateStudent(id, {
                first_name: student.first_name.trim(),
                last_name: student.last_name.trim(),
                level_id: Number(student.level_id),
                group_id: newGroupResponse.id,
                docs_url: student.docs_url || "",
              });
            })
          ).then(() => getStudents());
        }
        return getStudents();
      })
      .then((updatedStudents) => {
        setStudents(updatedStudents);
        setNewGroup({ name: "", level_id: "", teacher_id: "" });
        setBulkSelected([]);
        setIsAddGroupOpen(false);
        message.success(t.success.addGroup(trimmedGroupName));
      })
      .catch((error) => {
        console.error("Failed to add group:", error.response || error);
        message.error(error.response?.message || t.errors.addGroupFailed);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [
    newGroup,
    bulkSelected,
    groups,
    isSubmitting,
    levels,
    teachers,
    students,
    t,
  ]);

  const addGroupFromDrag = useCallback(() => {
    if (!activeStudent || isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      message.error(
        t.errors.required(t.groupName) + " " + t.errors.required(t.level)
      );
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (groups.some((g) => g.name === trimmedGroupName)) {
      message.error(t.errors.groupExists);
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      message.error(t.errors.invalidLevel);
      setIsSubmitting(false);
      return;
    }

    const teacher =
      newGroup.teacher_id !== "none" &&
      teachers.find((t) => t.id === Number(newGroup.teacher_id));
    if (newGroup.teacher_id !== "none" && !teacher) {
      message.error(t.errors.invalidTeacher);
      setIsSubmitting(false);
      return;
    }

    const group = {
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

    console.log("Creating group from drag with payload:", group);

    addGroup(group)
      .then((newGroupResponse) => {
        return getGroups().then((updatedGroups) => ({
          newGroupResponse,
          updatedGroups,
        }));
      })
      .then(({ newGroupResponse, updatedGroups }) => {
        return updateStudent(activeStudent.id, {
          first_name: activeStudent.first_name.trim(),
          last_name: activeStudent.last_name.trim(),
          level_id: Number(activeStudent.level_id),
          group_id: newGroupResponse.id,
          docs_url: activeStudent.docs_url || "",
        }).then(() =>
          Promise.all([getStudents(), Promise.resolve(updatedGroups)])
        );
      })
      .then(([updatedStudents, updatedGroups]) => {
        setStudents(updatedStudents);
        setGroups(updatedGroups);
        setNewGroup({ name: "", level_id: "", teacher_id: "" });
        setIsNewGroupPromptOpen(false);
        setActiveStudent(null);
        message.success(t.success.addGroup(trimmedGroupName));
      })
      .catch((error) => {
        console.error(
          "Failed to add group from drag:",
          error.response || error
        );
        message.error(error.response?.message || t.errors.addGroupFailed);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [newGroup, activeStudent, groups, isSubmitting, levels, teachers, t]);

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
        over.id === "unassigned" ? 0 : Number(over.id.split("-")[1]);
      if (targetGroupId === 0 || groups.some((g) => g.id === targetGroupId)) {
        if (student.group_id !== targetGroupId) {
          updateStudent(student.id, {
            first_name: student.first_name.trim(),
            last_name: student.last_name.trim(),
            level_id: Number(student.level_id),
            group_id: targetGroupId,
            docs_url: student.docs_url || "",
          })
            .then(() => {
              return getStudents();
            })
            .then((updatedStudents) => {
              setStudents(updatedStudents);
              message.success(t.success.updateStudent);
            })
            .catch((error) => {
              console.error(
                "Failed to reassign student:",
                error.response || error
              );
              message.error(
                error.response?.message || t.errors.updateStudentFailed
              );
            });
        }
      }
      setActiveStudent(null);
    },
    [students, groups, t]
  );

  const toggleSelectStudent = useCallback((id) => {
    setBulkSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];
      return newSelected;
    });
  }, []);

  const bulkAssignGroup = useCallback(
    (groupId) => {
      if (!bulkSelected.length || isSubmitting) return;
      setIsSubmitting(true);

      const targetGroupId = groupId === "unassigned" ? 0 : Number(groupId);
      if (targetGroupId === 0 || groups.some((g) => g.id === targetGroupId)) {
        Promise.all(
          bulkSelected.map((id) => {
            const student = students.find((s) => s.id === id);
            if (!student) {
              return Promise.reject(new Error(`Student ${id} not found`));
            }
            return updateStudent(id, {
              first_name: student.first_name.trim(),
              last_name: student.last_name.trim(),
              level_id: Number(student.level_id),
              group_id: targetGroupId,
              docs_url: student.docs_url || "",
            });
          })
        )
          .then(() => {
            return getStudents();
          })
          .then((updatedStudents) => {
            setStudents(updatedStudents);
            setBulkSelected([]);
            message.success(t.success.bulkAssign);
          })
          .catch((error) => {
            console.error("Failed to bulk assign:", error.response || error);
            message.error(error.response?.message || t.errors.bulkAssignFailed);
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        message.error(t.errors.invalidGroup);
        setIsSubmitting(false);
      }
    },
    [bulkSelected, isSubmitting, groups, students, t]
  );

  const exportCSV = useCallback(() => {
    const headers = [
      t.id,
      t.firstName,
      t.lastName,
      t.email,
      t.level,
      t.group,
      t.parent,
      t.approved,
      t.dob,
      t.nationalId,
      t.gender,
      t.enrollmentDate,
    ];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.first_name,
      s.last_name,
      s.email,
      levels.find((l) => l.id === s.level_id)?.name || "N/A",
      groups.find((g) => g.id === s.group_id)?.name || t.unassigned,
      parents.find((p) => p.id === s.parent_id)?.email || "N/A",
      s.is_approved ? t.yes : t.no,
      s.date_of_birth,
      s.national_id,
      s.gender === "M" ? t.male : t.female,
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
    message.success(t.success.exportCSV);
  }, [filteredStudents, levels, groups, parents, t]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (isLoading) {
    return <div className="p-6 text-center text-text">{t.loading}</div>;
  }

  return (
    <div
      className="p-4 sm:p-6 min-h-screen bg-background font-inter"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text flex items-center gap-2 animate-fade-in">
            <Users className="w-8 h-8 text-primary" /> {t.title}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setLanguage("ar")}
              variant={language === "ar" ? "default" : "outline"}
              className={
                language === "ar"
                  ? "bg-primary text-text-inverted"
                  : "border-border text-text"
              }
            >
              العربية
            </Button>
            <Button
              onClick={() => setLanguage("fr")}
              variant={language === "fr" ? "default" : "outline"}
              className={
                language === "fr"
                  ? "bg-primary text-text-inverted"
                  : "border-border text-text"
              }
            >
              Français
            </Button>
          </div>
        </div>
        {/* Filters */}
        <Card className="mb-6 bg-background-light shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level" className="font-semibold text-text">
                  {t.level}
                </Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger
                    id="level"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder={t.level} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">{t.allLevels}</SelectItem>
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
                  {t.group}
                </Label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger
                    id="group"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder={t.group} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">{t.allGroups}</SelectItem>
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
                  {t.search}
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="pr-10 border-border bg-background-light text-text"
                  />
                </div>
              </div>
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
                <Plus className="w-4 h-4 mr-2" /> {t.addStudent}
              </Button>
              <Button
                onClick={() => {
                  setIsAddGroupOpen(true);
                  setIsNewGroupPromptOpen(false);
                  setIsEditStudentOpen(false);
                }}
                className="bg-primary text-text-inverted hover:bg-primary-light w-full sm:w-auto"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                <Plus className="w-4 h-4 mr-2" /> {t.createGroup}
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
                  <SelectValue placeholder={t.bulkAssign} />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="unassigned">{t.unassigned}</SelectItem>
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
                <Download className="w-4 h-4 mr-2" /> {t.exportCSV}
              </Button>
            </div>
            {bulkSelected.length > 0 && (
              <p className="mt-4 text-sm text-text-muted">
                {t.selectedStudents(bulkSelected.length)}
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
                <p className="text-text-muted">{t.totalStudents}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-100">
                <p className="text-2xl font-bold text-primary">
                  {stats.assigned}
                </p>
                <p className="text-text-muted">{t.assignedStudents}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-200">
                <p className="text-2xl font-bold text-primary">
                  {stats.unassigned}
                </p>
                <p className="text-text-muted">{t.unassignedStudents}</p>
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
                    ? t.allAssignedStudents
                    : `${
                        groups.find((g) => g.id === Number(groupFilter))
                          ?.name || t.group
                      } ${t.groupStudents}`
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
                t={t}
              />
            </div>
            {/* Unassigned */}
            <div>
              <StudentList
                title={t.unassignedStudentsTitle}
                students={unassignedStudents}
                onEdit={(student) => {
                  setEditStudent(student);
                  setIsEditStudentOpen(true);
                }}
                onDelete={handleDeleteStudent}
                onSelect={toggleSelectStudent}
                bulkSelected={bulkSelected}
                activeStudent={activeStudent}
                t={t}
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
                        {t.level}:{" "}
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
                        ?.name || t.unassigned}
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
                {t.addStudentTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first_name" className="text-text">
                  {t.firstName}
                </Label>
                <Input
                  id="first_name"
                  value={newStudent.first_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, first_name: e.target.value })
                  }
                  placeholder={t.namePlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-text">
                  {t.lastName}
                </Label>
                <Input
                  id="last_name"
                  value={newStudent.last_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, last_name: e.target.value })
                  }
                  placeholder={t.lastNamePlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-text">
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  placeholder={t.emailPlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth" className="text-text">
                  {t.dob}
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
                  {t.nationalId}
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
                  placeholder={t.nationalIdPlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-text">
                  {t.gender}
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
                    <SelectValue placeholder={t.gender} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="M">{t.male}</SelectItem>
                    <SelectItem value="F">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level_id" className="text-text">
                  {t.levelSelect}
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
                    <SelectValue placeholder={t.levelSelect} />
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
                  {t.groupSelect}
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
                    <SelectValue placeholder={t.groupSelect} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">{t.unassigned}</SelectItem>
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
                  {t.parent}
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
                    <SelectValue placeholder={t.parent} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {parents.map((p) => (
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
                {t.cancel}
              </Button>
              <Button
                onClick={addStudentHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                {t.addStudentBtn}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                {t.editStudentTitle}
              </DialogTitle>
            </DialogHeader>
            {editStudent ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-text">{t.firstName}</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.first_name} {editStudent.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-text">{t.email}</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.email}
                  </p>
                </div>
                <div>
                  <Label className="text-text">{t.dob}</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.date_of_birth}
                  </p>
                </div>
                <div>
                  <Label className="text-text">{t.nationalId}</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.national_id}
                  </p>
                </div>
                <div>
                  <Label className="text-text">{t.gender}</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.gender === "M" ? t.male : t.female}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-level_id" className="text-text">
                    {t.levelSelect}
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
                      <SelectValue placeholder={t.levelSelect} />
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
                    {t.groupSelect}
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
                      <SelectValue placeholder={t.groupSelect} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="none">{t.unassigned}</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">{t.noStudents}</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditStudentOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={editStudentGroup}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting || !editStudent}
                style={{ backgroundColor: "#0771CB" }}
              >
                {t.saveChanges}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Add Group Dialog */}
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                {t.createGroupTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group_name" className="text-text">
                  {t.groupName}
                </Label>
                <Input
                  id="group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder={t.groupNamePlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="group_level_id" className="text-text">
                  {t.levelSelect}
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
                    <SelectValue placeholder={t.levelSelect} />
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
                  {t.teacher}
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
                    <SelectValue placeholder={t.teacher} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">{t.none}</SelectItem>
                    {teachers.map((t) => (
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
                {t.cancel}
              </Button>
              <Button
                onClick={addGroupHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                {t.createGroupBtn}
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
                {t.createGroupTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="drag_group_name" className="text-text">
                  {t.groupName}
                </Label>
                <Input
                  id="drag_group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder={t.dragGroupNamePlaceholder}
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="drag_group_level_id" className="text-text">
                  {t.levelSelect}
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
                    <SelectValue placeholder={t.levelSelect} />
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
                  {t.teacher}
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
                    <SelectValue placeholder={t.teacher} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">{t.none}</SelectItem>
                    {teachers.map((t) => (
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
                {t.cancel}
              </Button>
              <Button
                onClick={addGroupFromDrag}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                {t.createAndAssign}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                {t.deleteConfirmTitle}
              </DialogTitle>
            </DialogHeader>
            <p className="text-text-muted">{t.deleteConfirmText}</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-error text-text-inverted hover:bg-error-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#EA5455" }}
              >
                {t.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
