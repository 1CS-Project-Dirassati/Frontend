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
import apiCall from "@/components/utils/apiCall";

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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const token = useSelector((state) => state.auth.accessToken);
  const language = "fr";
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [{ data, total }, levelsData, groupsData] = await Promise.all([
          getStudents(pagination.current, pagination.pageSize),
          getLevels(),
          getGroups(),
        ]);
        setStudents(data);
        setLevels(levelsData);
        setGroups(groupsData);
        setPagination((prev) => ({ ...prev, total }));
      } catch {
        message.error(t.errors.loadDataFailed);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const getStudents = async (page = 1, limit = 10) => {
    const res = await apiCall(
      "get",
      `/api/students/?is_approved=1&page=${page}&limit=${limit}`,
      null,
      { token }
    );
    return {
      data: Array.isArray(res.students) ? res.students : [],
      total: res.total || 0,
    };
  };

  const getLevels = async () => {
    const res = await apiCall("get", "/api/levels/", null, { token });
    return Array.isArray(res.levels) ? res.levels : [];
  };

  const getGroups = async () => {
    const res = await apiCall("get", "/api/groups/", null, { token });
    return Array.isArray(res.groups) ? res.groups : [];
  };

  const updateStudent = async (id, values) => {
    await apiCall("put", `/api/students/${id}`, values, { token });
    message.success(t.success.updateStudent);
  };

  const handleTableChange = (paginationInfo) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
  };

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

  const handleEditStudent = async () => {
    if (!editStudent) return;
    const levelValid = levels.some(
      (l) => l.id === Number(editStudent.level_id)
    );
    const groupValid =
      editStudent.group_id === "none" ||
      groups.some((g) => g.id === Number(editStudent.group_id));
    if (!levelValid) return message.error(t.errors.invalidLevel);
    if (!groupValid) return message.error(t.errors.invalidGroup);

    await updateStudent(editStudent.id, {
      level_id: Number(editStudent.level_id),
      group_id:
        editStudent.group_id === "none" ? null : Number(editStudent.group_id),
    });

    const { data } = await getStudents(pagination.current, pagination.pageSize);
    setStudents(data);
    setEditDialogOpen(false);
    setEditStudent(null);
  };

  const sendNotification = async () => {
    if (!notificationText.trim())
      return message.error("Veuillez entrer un message.");
    await apiCall(
      "post",
      `/api/notifications/`,
      {
        student_id: selectedStudent.id,
        message: notificationText,
      },
      { token }
    );
    message.success(`Notification envoyée à l'étudiant ${selectedStudent.id}`);
    setNotifyDialogOpen(false);
    setNotificationText("");
    setSelectedStudent(null);
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
      title: "Nom",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Niveau",
      render: (_, record) => getLevelName(record.level_id),
    },
    {
      title: "Groupe",
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
        dataSource={students.filter(
          (s) => s.is_approved && s.is_active !== false
        )}
        rowKey="id"
        bordered
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} étudiants`,
        }}
      />

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.viewStudentTitle}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-2">
              <p>
                <strong>{t.firstName}:</strong> {selectedStudent.first_name}
              </p>
              <p>
                <strong>{t.lastName}:</strong> {selectedStudent.last_name}
              </p>
              <p>
                <strong>{t.email}:</strong> {selectedStudent.email}
              </p>
              <p>
                <strong>{t.dob}:</strong> {selectedStudent.date_of_birth}
              </p>
              <p>
                <strong>{t.nationalId}:</strong> {selectedStudent.national_id}
              </p>
              <p>
                <strong>{t.gender}:</strong>{" "}
                {selectedStudent.gender === "male" ? t.male : t.female}
              </p>
              <p>
                <strong>{t.level}:</strong>{" "}
                {getLevelName(selectedStudent.level_id)}
              </p>
              <p>
                <strong>{t.group}:</strong>{" "}
                {getGroupName(selectedStudent.group_id)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editStudentTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>{t.level}</Label>
            <Select
              value={editStudent?.level_id || ""}
              onValueChange={(value) =>
                setEditStudent((prev) => ({ ...prev, level_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>{t.group}</Label>
            <Select
              value={editStudent?.group_id || "none"}
              onValueChange={(value) =>
                setEditStudent((prev) => ({ ...prev, group_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.unassigned}</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <ShadcnButton onClick={handleEditStudent}>
              {t.saveChanges}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="w-full h-[80vh] max-w-5xl">
          {pdfFile && (
            <iframe
              src={pdfFile}
              className="w-full h-full"
              frameBorder="0"
              title="PDF Document"
            ></iframe>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.notify}</DialogTitle>
          </DialogHeader>
          <ShadcnInput
            value={notificationText}
            onChange={(e) => setNotificationText(e.target.value)}
            placeholder="Entrez votre message ici"
          />
          <DialogFooter>
            <ShadcnButton onClick={sendNotification}>
              {t.saveChanges}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
