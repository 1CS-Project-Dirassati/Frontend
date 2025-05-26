"use client";

import { useState, useEffect } from "react";
import { Table, Dropdown, Button, message } from "antd";
import {
  MoreOutlined,
  FilePdfOutlined,
  EyeOutlined,
  EditOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall"; // Adjust path as needed

// Translation object (extended from StudentsGroups)
const translations = {
  fr: {
    title: "Étudiants Approuvés",
    success: {
      loadData: "Données chargées avec succès !",
      updateStudent: "Étudiant mis à jour avec succès !",
    },
    errors: {
      loadDataFailed: "Échec du chargement des données.",
      updateStudentFailed: "Échec de la mise à jour de l'étudiant.",
      invalidLevel: "Le niveau sélectionné est invalide.",
      invalidGroup: "Le groupe sélectionné est invalide.",
    },
    viewStudentTitle: "Détails de l'étudiant",
    editStudentTitle: "Modifier l'étudiant",
    firstName: "Prénom",
    lastName: "Nom de famille",
    email: "Email",
    level: "Niveau",
    group: "Groupe",
    dob: "Date de naissance",
    nationalId: "Numéro national",
    gender: "Genre",
    male: "Homme",
    female: "Femme",
    unassigned: "Non affecté",
    notify: "Envoyer une notification",
    saveChanges: "Enregistrer les modifications",
    cancel: "Annuler",
    viewDocuments: "Voir les documents",
    view: "Voir",
    edit: "Modifier",
    loading: "Chargement...",
  },
};

export default function ApprovedStudents() {
  const [students, setStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector((state) => state.auth.accessToken);
  const language = "fr"; // Default to French; adjust as needed
  const t = translations[language];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsData, levelsData, groupsData] = await Promise.all([
          getStudents(),
          getLevels(),
          getGroups(),
        ]);
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        setLevels(Array.isArray(levelsData) ? levelsData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (error) {
        console.error("Failed to load data:", error);
        message.error(t.errors.loadDataFailed);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, t]);

  const getStudents = async () => {
    try {
      const response = await apiCall(
        "get",
        "/api/students/?is_approved=1",
        null,
        { token }
      );
      message.success(t.success.loadData);
      return response.students || response;
    } catch (err) {
      message.error(t.errors.loadDataFailed);
      throw err;
    }
  };

  const updateStudent = async (id, values) => {
    try {
      await apiCall("put", `/api/students/${id}`, values, { token });
      message.success(t.success.updateStudent);
    } catch (err) {
      message.error(t.errors.updateStudentFailed);
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

  // Filter for approved students
  const approvedStudents = students.filter(
    (s) => s.is_approved && s.is_active !== false
  );

  const getLevelName = (id) => levels.find((l) => l.id === id)?.name || "—";
  const getGroupName = (id) =>
    groups.find((g) => g.id === id)?.name || t.unassigned;

  const openPdf = (url) => {
    setPdfFile(
      url ||
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    );
    setPdfDialogOpen(true);
  };

  const openNotify = (student) => {
    setSelectedStudent(student);
    setNotifyDialogOpen(true);
  };

  const openView = (student) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const openEdit = (student) => {
    setEditStudent({
      id: student.id,
      level_id: String(student.level_id || ""),
      group_id: student.group_id ? String(student.group_id) : "none",
    });
    setEditDialogOpen(true);
  };

  const sendNotification = async () => {
    if (!notificationText.trim()) {
      message.error("Please enter a notification message.");
      return;
    }
    try {
      await apiCall(
        "post",
        `/api/notifications/`,
        {
          student_id: selectedStudent.id,
          message: notificationText,
        },
        { token }
      );
      message.success(`Notification sent to student ${selectedStudent.id}`);
      setNotifyDialogOpen(false);
      setNotificationText("");
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to send notification:", error);
      message.error("Failed to send notification.");
    }
  };

  const handleEditStudent = async () => {
    if (!editStudent) return;
    try {
      const updates = {
        level_id: Number(editStudent.level_id),
        group_id:
          editStudent.group_id === "none" ? null : Number(editStudent.group_id),
      };
      if (!levels.find((l) => l.id === Number(editStudent.level_id))) {
        message.error(t.errors.invalidLevel);
        return;
      }
      if (
        editStudent.group_id !== "none" &&
        !groups.find((g) => g.id === Number(editStudent.group_id))
      ) {
        message.error(t.errors.invalidGroup);
        return;
      }
      await updateStudent(editStudent.id, updates);
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
      setEditDialogOpen(false);
      setEditStudent(null);
    } catch (error) {
      console.error("Failed to update student:", error);
      message.error(t.errors.updateStudentFailed);
    }
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: "view",
        label: (
          <span>
            <EyeOutlined className="mr-2" />
            {t.view}
          </span>
        ),
        onClick: () => openView(record),
      },
      {
        key: "edit",
        label: (
          <span>
            <EditOutlined className="mr-2" />
            {t.edit}
          </span>
        ),
        onClick: () => openEdit(record),
      },
      {
        key: "docs",
        label: (
          <span>
            <FilePdfOutlined className="mr-2" />
            {t.viewDocuments}
          </span>
        ),
        onClick: () => openPdf(record.docs_url),
      },
      {
        key: "notify",
        label: (
          <span>
            <BellOutlined className="mr-2" />
            {t.notify}
          </span>
        ),
        onClick: () => openNotify(record),
      },
    ],
  });

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Level",
      render: (_, record) => getLevelName(record.level_id),
    },
    {
      title: "Group",
      render: (_, record) => getGroupName(record.group_id),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
      <Table
        columns={columns}
        dataSource={approvedStudents}
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t.viewDocuments}</DialogTitle>
          </DialogHeader>
          <iframe src={pdfFile} className="w-full h-full" title="Student PDF" />
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.viewStudentTitle}</DialogTitle>
            <DialogDescription>
              {selectedStudent
                ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent ? (
            <div className="space-y-4">
              <div>
                <Label className="text-text">{t.firstName}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.first_name}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.lastName}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.last_name}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.email}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.email}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.level}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {getLevelName(selectedStudent.level_id)}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.group}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {getGroupName(selectedStudent.group_id)}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.dob}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.date_of_birth}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.nationalId}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.national_id}
                </p>
              </div>
              <div>
                <Label className="text-text">{t.gender}</Label>
                <p className="p-2 bg-background-dark rounded-md text-text">
                  {selectedStudent.gender === "M" ? t.male : t.female}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-text-muted">Aucun étudiant sélectionné</p>
          )}
          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              {t.cancel}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editStudentTitle}</DialogTitle>
            <DialogDescription>
              {editStudent
                ? `Modifier les détails pour l'étudiant ID: ${editStudent.id}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {editStudent ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-level_id" className="text-text">
                  {t.level}
                </Label>
                <Select
                  value={editStudent.level_id}
                  onValueChange={(value) =>
                    setEditStudent({ ...editStudent, level_id: value })
                  }
                >
                  <SelectTrigger
                    id="edit-level_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder={t.level} />
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
                  {t.group}
                </Label>
                <Select
                  value={editStudent.group_id}
                  onValueChange={(value) =>
                    setEditStudent({ ...editStudent, group_id: value })
                  }
                >
                  <SelectTrigger
                    id="edit-group_id"
                    className="border-border bg-background-light text-text"
                  >
                    <SelectValue placeholder={t.group} />
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
            <p className="text-text-muted">Aucun étudiant sélectionné</p>
          )}
          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditStudent(null);
              }}
            >
              {t.cancel}
            </ShadcnButton>
            <ShadcnButton onClick={handleEditStudent}>
              {t.saveChanges}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.notify}</DialogTitle>
            <DialogDescription>
              To student ID: {selectedStudent?.id || ""}
            </DialogDescription>
          </DialogHeader>
          <ShadcnInput
            placeholder="Type your message..."
            value={notificationText}
            onChange={(e) => setNotificationText(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <ShadcnButton
              variant="outline"
              onClick={() =>
                setNotificationText("Please update your profile information.")
              }
            >
              Update Profile
            </ShadcnButton>
            <ShadcnButton
              variant="outline"
              onClick={() =>
                setNotificationText("Your group assignment has been updated.")
              }
            >
              Group Updated
            </ShadcnButton>
            <ShadcnButton onClick={sendNotification}>Send</ShadcnButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
