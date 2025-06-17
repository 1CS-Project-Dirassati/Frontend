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
        <p className="text-sm text-text-muted">Level: {levelName}</p>
      )}
      {teacherName && (
        <p className="text-sm text-text-muted">Teacher: {teacherName}</p>
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
            <Badge className="bg-primary text-text-inverted">0 students</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center">No students</p>
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
            {students.length} {students.length === 1 ? "student" : "students"}
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
              <p className="text-text-muted text-center">No students</p>
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
  const token = useSelector((state) => state.auth.accessToken);

  // Data Fetching and Manipulation Functions
  const getStudents = async () => {
    try {
      const params = new URLSearchParams({
        is_approved: "1",
        archived: "0",
        page: "1",
        per_page: "100",
      });
      if (levelFilter !== "All") params.append("level_id", levelFilter);
      if (groupFilter !== "All" && groupFilter !== "unassigned") {
        params.append("group_id", groupFilter);
      } else if (groupFilter === "unassigned") {
        params.append("group_id", "0");
      }
      const response = await apiCall(
        "get",
        `/api/students/?${params.toString()}`,
        null,
        { token }
      );
      message.success("Data loaded successfully");
      return response.students || response;
    } catch (err) {
      message.error("Failed to load student data");
      throw err;
    }
  };

  const updateStudent = async (id, values) => {
    try {
      await apiCall("put", `/api/students/${id}`, values, { token });
      message.success("Student updated successfully");
    } catch (err) {
      message.error("Failed to update student");
      throw err;
    }
  };

  const getGroups = async () => {
    try {
      const response = await apiCall(
        "get",
        "/api/groups/?per_page=1000",
        null,
        { token }
      );
      return response.groups || response;
    } catch (err) {
      message.error("Failed to load group data");
      throw err;
    }
  };

  const getLevels = async () => {
    try {
      const response = await apiCall("get", "/api/levels/", null, { token });
      return response.levels || response;
    } catch (err) {
      message.error("Failed to load level data");
      throw err;
    }
  };

  const getParents = async () => {
    try {
      const response = await apiCall("get", "/api/parents/", null, { token });
      return response.parents || response;
    } catch (err) {
      message.error("Failed to load parent data");
      throw err;
    }
  };

  const getTeachers = async () => {
    try {
      const response = await apiCall("get", "/api/teachers/", null, { token });
      return response.teachers || response;
    } catch (err) {
      message.error("Failed to load teacher data");
      throw err;
    }
  };

  const addGroup = async (groupData) => {
    try {
      const response = await apiCall("post", "/api/groups/", groupData, {
        token,
      });
      message.success(`Group ${groupData.name} created successfully`);
      return response;
    } catch (err) {
      message.error("Failed to create group");
      throw err;
    }
  };

  const deleteStudent = async (id) => {
    try {
      await apiCall("delete", `/api/students/${id}`, null, { token });
      message.success("Student deleted successfully");
    } catch (err) {
      message.error("Failed to delete student");
      throw err;
    }
  };

  const addStudent = async (studentData) => {
    try {
      await apiCall("post", "/api/students/", studentData, { token });
      message.success("Student added successfully");
    } catch (err) {
      message.error("Failed to add student");
      throw err;
    }
  };

  // Initial Data Fetch and Refetch on Filter Change
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
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setLevels(Array.isArray(levelsData) ? levelsData : []);
        setParents(Array.isArray(parentsData) ? parentsData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        message.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [levelFilter, groupFilter]);

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    return students.filter((student) => {
      const matchesSearch =
        student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.national_id?.includes(searchQuery);
      return matchesSearch && student.is_active !== false;
    });
  }, [students, searchQuery]);

  const groupStudents = useMemo(() => {
    return filteredStudents.filter(
      (s) => s.group_id && groupFilter !== "unassigned"
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

  const availableGroups = useMemo(() => {
    if (!newStudent.level_id && !editStudent?.level_id) return groups;
    const levelId = Number(newStudent.level_id || editStudent?.level_id);
    return groups.filter((g) => g.level_id === levelId);
  }, [groups, newStudent.level_id, editStudent]);

  const addStudentHandler = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const requiredFields = [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "level_id", label: "Level" },
      { key: "parent_id", label: "Parent" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "national_id", label: "National ID" },
      { key: "gender", label: "Gender" },
    ];
    for (const field of requiredFields) {
      if (!newStudent[field.key]?.trim()) {
        message.error(`Please fill in ${field.label}`);
        setIsSubmitting(false);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      message.error("Please enter a valid email");
      setIsSubmitting(false);
      return;
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(newStudent.date_of_birth)) {
      message.error("Please enter a valid date of birth (YYYY-MM-DD)");
      setIsSubmitting(false);
      return;
    }

    const nationalIdRegex = /^\d{10}$/;
    if (!nationalIdRegex.test(newStudent.national_id)) {
      message.error("National ID must be 10 digits");
      setIsSubmitting(false);
      return;
    }

    if (!["M", "F"].includes(newStudent.gender)) {
      message.error("Gender must be 'Male' or 'Female'");
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newStudent.level_id));
    if (!level) {
      message.error("Invalid level selected");
      setIsSubmitting(false);
      return;
    }

    const group =
      newStudent.group_id && newStudent.group_id !== "none"
        ? groups.find((g) => g.id === Number(newStudent.group_id))
        : null;
    if (newStudent.group_id && newStudent.group_id !== "none" && !group) {
      message.error("Invalid group selected");
      setIsSubmitting(false);
      return;
    }
    if (group && group.level_id !== Number(newStudent.level_id)) {
      message.error("Group level must match student level");
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
      .then(() => getStudents())
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
  }, [newStudent, isSubmitting, levels, groups]);

  const editStudentGroup = useCallback(() => {
    if (!editStudent || isSubmitting) return;
    setIsSubmitting(true);

    const level = levels.find((l) => l.id === Number(editStudent.level_id));
    if (!level) {
      message.error("Invalid level selected");
      setIsSubmitting(false);
      return;
    }

    const group =
      editStudent.group_id !== "none"
        ? groups.find((g) => g.id === Number(editStudent.group_id))
        : null;
    if (editStudent.group_id !== "none" && !group) {
      message.error("Invalid group selected");
      setIsSubmitting(false);
      return;
    }
    if (group && group.level_id !== Number(editStudent.level_id)) {
      message.error("Group level must match student level");
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

    updateStudent(editStudent.id, updates)
      .then(() => getStudents())
      .then((updatedStudents) => {
        setStudents(updatedStudents);
        setEditStudent(null);
        setIsEditStudentOpen(false);
      })
      .catch((error) => {
        message.error("Failed to update student");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [editStudent, isSubmitting, levels, groups]);

  const handleDeleteStudent = useCallback((id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteId || isSubmitting) return;
    setIsSubmitting(true);

    deleteStudent(deleteId)
      .then(() => getStudents())
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
  }, [deleteId, isSubmitting]);

  const addGroupHandler = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      message.error("Please fill in Group Name and Level");
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (
      groups.some(
        (g) => g.name.toLowerCase() === trimmedGroupName.toLowerCase()
      )
    ) {
      message.error("Group already exists");
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      message.error("Invalid level selected");
      setIsSubmitting(false);
      return;
    }

    const teacher =
      newGroup.teacher_id !== "none" &&
      teachers.find((t) => t.id === Number(newGroup.teacher_id));
    if (newGroup.teacher_id !== "none" && !teacher) {
      message.error("Invalid teacher selected");
      setIsSubmitting(false);
      return;
    }

    const group = {
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

    addGroup(group)
      .then((newGroupResponse) => {
        setGroups((prev) => [...prev, newGroupResponse]);
        if (bulkSelected.length > 0) {
          const invalidStudents = bulkSelected
            .map((id) => students.find((s) => s.id === id))
            .filter((s) => s && s.level_id !== Number(newGroup.level_id));
          if (invalidStudents.length > 0) {
            message.error("Some selected students have mismatched levels");
            setIsSubmitting(false);
            return Promise.reject();
          }
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
      })
      .catch(() => {})
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
  ]);

  const addGroupFromDrag = useCallback(() => {
    if (!activeStudent || isSubmitting) return;
    setIsSubmitting(true);

    if (!newGroup.name.trim() || !newGroup.level_id) {
      message.error("Please fill in Group Name and Level");
      setIsSubmitting(false);
      return;
    }

    if (Number(newGroup.level_id) !== activeStudent.level_id) {
      message.error("Group level must match student level");
      setIsSubmitting(false);
      return;
    }

    const trimmedGroupName = newGroup.name.trim();
    if (groups.some((g) => g.name === trimmedGroupName)) {
      message.error("Group already exists");
      setIsSubmitting(false);
      return;
    }

    const level = levels.find((l) => l.id === Number(newGroup.level_id));
    if (!level) {
      message.error("Invalid level selected");
      setIsSubmitting(false);
      return;
    }

    const teacher =
      newGroup.teacher_id !== "none" &&
      teachers.find((t) => t.id === Number(newGroup.teacher_id));
    if (newGroup.teacher_id !== "none" && !teacher) {
      message.error("Invalid teacher selected");
      setIsSubmitting(false);
      return;
    }

    const group = {
      name: trimmedGroupName,
      level_id: Number(newGroup.level_id),
      teacher_id:
        newGroup.teacher_id === "none" ? null : Number(newGroup.teacher_id),
    };

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
      })
      .catch((error) => {
        console.error("Failed to add group from drag:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [newGroup, activeStudent, groups, isSubmitting, levels, teachers]);

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
      const group = targetGroupId
        ? groups.find((g) => g.id === targetGroupId)
        : null;
      if (group && group.level_id !== student.level_id) {
        message.error("Cannot assign to group with different level");
        setActiveStudent(null);
        return;
      }
      if (targetGroupId === 0 || groups.some((g) => g.id === targetGroupId)) {
        if (student.group_id !== targetGroupId) {
          updateStudent(student.id, {
            first_name: student.first_name.trim(),
            last_name: student.last_name.trim(),
            level_id: Number(student.level_id),
            group_id: targetGroupId,
            docs_url: student.docs_url || "",
          })
            .then(() => getStudents())
            .then((updatedStudents) => {
              setStudents(updatedStudents);
              message.success("Student reassigned successfully");
            })
            .catch((error) => {
              message.error("Failed to reassign student");
            });
        }
      }
      setActiveStudent(null);
    },
    [students, groups]
  );

  const toggleSelectStudent = useCallback((id) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const bulkAssignGroup = useCallback(
    (groupId) => {
      if (!bulkSelected.length || isSubmitting) return;
      setIsSubmitting(true);

      const targetGroupId = groupId === "unassigned" ? 0 : Number(groupId);
      const group = targetGroupId
        ? groups.find((g) => g.id === targetGroupId)
        : null;
      const invalidStudents = bulkSelected
        .map((id) => students.find((s) => s.id === id))
        .filter((s) => s && group && s.level_id !== group.level_id);
      if (invalidStudents.length > 0) {
        message.error("Some selected students have mismatched levels");
        setIsSubmitting(false);
        return;
      }

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
          .then(() => getStudents())
          .then((updatedStudents) => {
            setStudents(updatedStudents);
            setBulkSelected([]);
            message.success("Students assigned successfully");
          })
          .catch(() => {
            message.error("Failed to assign students");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        message.error("Invalid group selected");
        setIsSubmitting(false);
      }
    },
    [bulkSelected, isSubmitting, groups, students]
  );

  const exportCSV = useCallback(() => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Level",
      "Group",
      "Parent",
      "Approved",
      "Date of Birth",
      "National ID",
      "Gender",
      "Enrollment Date",
    ];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.first_name,
      s.last_name,
      s.email,
      levels.find((l) => l.id === s.level_id)?.name || "N/A",
      groups.find((g) => g.id === s.group_id)?.name || "Unassigned",
      parents.find((p) => p.id === s.parent_id)?.email || "N/A",
      s.is_approved ? "Yes" : "No",
      s.date_of_birth,
      s.national_id,
      s.gender === "M" ? "Male" : "Female",
      s.enrollment_date,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a: href = url;
    a.download = "students_groups.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("CSV exported successfully");
  }, [filteredStudents, levels, groups, parents]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (isLoading) {
    return <div className="p-6 text-center text-text">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-background font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text flex items-center gap-2 animate-fade-in">
            <Users className="w-8 h-8 text-primary" /> Student Groups
          </h1>
        </div>
        <Card className="mb-6 bg-background-light shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level" className="font-semibold text-text">
                  Level
                </Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger
                    id="level"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">All Levels</SelectItem>
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
                  Group
                </Label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger
                    id="group"
                    className="mt-1 border-border bg-background-light"
                  >
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="All">All Groups</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {groups
                      .filter(
                        (g) =>
                          levelFilter === "All" ||
                          g.level_id === Number(levelFilter)
                      )
                      .map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search" className="font-semibold text-text">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or national ID..."
                    className="pr-10 border-border bg-background-light text-text"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6 bg-background-light shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-primary text-text-inverted hover:bg-primary-light w-full sm:w-auto"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Student
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
                <Plus className="w-4 h-4 mr-2" /> Create Group
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
                  <SelectValue placeholder="Bulk Assign to Group" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {groups
                    .filter(
                      (g) =>
                        levelFilter === "All" ||
                        g.level_id === Number(levelFilter)
                    )
                    .map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name} (
                        {levels.find((l) => l.id === g.level_id)?.name || "N/A"}
                        )
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                onClick={exportCSV}
                className="bg-accent text-text-inverted hover:bg-accent-light w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
            {bulkSelected.length > 0 && (
              <p className="mt-4 text-sm text-text-muted">
                {bulkSelected.length} student
                {bulkSelected.length > 1 ? "s" : ""} selected
              </p>
            )}
          </CardContent>
        </Card>
        <Card
          className="mb-6 bg-background-light shadow-card"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-text-muted">Total Students</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-100">
                <p className="text-2xl font-bold text-primary">
                  {stats.assigned}
                </p>
                <p className="text-text-muted">Assigned to Groups</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-card animate-slide-up delay-200">
                <p className="text-2xl font-bold text-primary">
                  {stats.unassigned}
                </p>
                <p className="text-text-muted">Unassigned Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <StudentList
                title={
                  groupFilter === "All"
                    ? "All Assigned Students"
                    : groupFilter === "unassigned"
                    ? "Unassigned Students"
                    : `${
                        groups.find((g) => g.id === Number(groupFilter))
                          ?.name || "Group"
                      } Students`
                }
                students={
                  groupFilter === "unassigned"
                    ? unassignedStudents
                    : groupStudents
                }
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
            <div>
              <StudentList
                title="Unassigned Students"
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
                        Level:{" "}
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
                        ?.name || "Unassigned"}
                    </Badge>
                  </div>
                </div>
              )}
            </DragOverlay>
          </div>
        </DndContext>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                Add New Student
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first_name" className="text-text">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={newStudent.first_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, first_name: e.target.value })
                  }
                  placeholder="e.g., Amina"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-text">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={newStudent.last_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, last_name: e.target.value })
                  }
                  placeholder="e.g., Bouchama"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-text">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  placeholder="e.g., amina@example.com"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth" className="text-text">
                  Date of Birth
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
                  National ID
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
                  placeholder="e.g., 1234567890"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-text">
                  Gender
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
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level_id" className="text-text">
                  Level
                </Label>
                <Select
                  value={newStudent.level_id}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      level_id: value,
                      group_id: "",
                    })
                  }
                >
                  <SelectTrigger
                    id="level_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="Select Level" />
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
                  Group (Optional)
                </Label>
                <Select
                  value={newStudent.group_id || "none"}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, group_id: value })
                  }
                  disabled={!newStudent.level_id}
                >
                  <SelectTrigger
                    id="group_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">Unassigned</SelectItem>
                    {availableGroups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parent_id" className="text-text">
                  Parent
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
                    <SelectValue placeholder="Select Parent" />
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
                Cancel
              </Button>
              <Button
                onClick={addStudentHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                Edit Student
              </DialogTitle>
            </DialogHeader>
            {editStudent ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-text">First Name</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.first_name} {editStudent.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-text">Email</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.email}
                  </p>
                </div>
                <div>
                  <Label className="text-text">Date of Birth</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.date_of_birth}
                  </p>
                </div>
                <div>
                  <Label className="text-text">National ID</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.national_id}
                  </p>
                </div>
                <div>
                  <Label className="text-text">Gender</Label>
                  <p className="p-2 bg-background-dark rounded-md text-text">
                    {editStudent.gender === "M" ? "Male" : "Female"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-level_id" className="text-text">
                    Level
                  </Label>
                  <Select
                    value={String(editStudent.level_id || "")}
                    onValueChange={(value) =>
                      setEditStudent({
                        ...editStudent,
                        level_id: value,
                        group_id: "none",
                      })
                    }
                  >
                    <SelectTrigger
                      id="edit-level_id"
                      className="border-border bg-background-light text-text"
                    >
                      <SelectValue placeholder="Select Level" />
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
                    Group (Optional)
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
                    disabled={!editStudent.level_id}
                  >
                    <SelectTrigger
                      id="edit-group_id"
                      className="border-border bg-background-light text-text"
                    >
                      <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="none">Unassigned</SelectItem>
                      {availableGroups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">No students</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditStudentOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={editStudentGroup}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting || !editStudent}
                style={{ backgroundColor: "#0771CB" }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                Create New Group
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group_name" className="text-text">
                  Group Name
                </Label>
                <Input
                  id="group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="e.g., Math Group A"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="group_level_id" className="text-text">
                  Level
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
                    <SelectValue placeholder="Select Level" />
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
                  Teacher (Optional)
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
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">None</SelectItem>
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
                Cancel
              </Button>
              <Button
                onClick={addGroupHandler}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isNewGroupPromptOpen}
          onOpenChange={setIsNewGroupPromptOpen}
        >
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                Create New Group
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="drag_group_name" className="text-text">
                  Group Name
                </Label>
                <Input
                  id="drag_group_name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="e.g., Science Group B"
                  className="border-border bg-background-light text-text"
                />
              </div>
              <div>
                <Label htmlFor="drag_group_level_id" className="text-text">
                  Level
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
                    <SelectValue placeholder="Select Level" />
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
                  Teacher (Optional)
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
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">None</SelectItem>
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
                Cancel
              </Button>
              <Button
                onClick={addGroupFromDrag}
                className="bg-primary text-text-inverted hover:bg-primary-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#0771CB" }}
              >
                Create and Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-background-light max-w-md animate-zoom-in">
            <DialogHeader>
              <DialogTitle className="text-lg text-text">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-text-muted">
              Are you sure you want to delete this student? This action is
              irreversible.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-border text-text hover:bg-background-dark"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-error text-text-inverted hover:bg-error-light"
                disabled={isSubmitting}
                style={{ backgroundColor: "#EA5455" }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
