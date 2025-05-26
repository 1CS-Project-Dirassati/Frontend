"use client";

import { useState, useEffect } from "react";
import { Table, Dropdown, Button, message } from "antd";
import {
  MoreOutlined,
  FilePdfOutlined,
  CheckOutlined,
  CloseOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

// 🈯 Translations
const translations = {
  fr: {
    labels: {
      name: "Nom",
      email: "Email",
      level: "Niveau",
      group: "Groupe",
      actions: "Actions",
      unapprovedStudents: "Étudiants non approuvés",
      viewDocs: "Voir les documents",
      accept: "Accepter",
      reject: "Rejeter",
      sendNotification: "Envoyer une notification",
      typeMessage: "Écrivez votre message...",
      missingDocs: "Documents manquants",
      underReview: "Demande en cours d'examen",
      send: "Envoyer",
    },
    success: {
      loadData: "Données chargées avec succès !",
      updateStudent: "Étudiant mis à jour avec succès !",
      notificationSent: "Notification envoyée à l'étudiant",
    },
    errors: {
      loadDataFailed: "Échec du chargement des données.",
      updateStudentFailed: "Échec de la mise à jour de l'étudiant.",
      notificationFailed: "Échec de l'envoi de la notification.",
      emptyNotification: "Veuillez entrer un message de notification.",
    },
  },
  en: {
    labels: {
      name: "Name",
      email: "Email",
      level: "Level",
      group: "Group",
      actions: "Actions",
      unapprovedStudents: "Unapproved Students",
      viewDocs: "View Documents",
      accept: "Accept",
      reject: "Reject",
      sendNotification: "Send Notification",
      typeMessage: "Type your message...",
      missingDocs: "Missing Docs",
      underReview: "Under Review",
      send: "Send",
    },
    success: {
      loadData: "Data loaded successfully!",
      updateStudent: "Student updated successfully!",
      notificationSent: "Notification sent to student",
    },
    errors: {
      loadDataFailed: "Failed to load data.",
      updateStudentFailed: "Failed to update student.",
      notificationFailed: "Failed to send notification.",
      emptyNotification: "Please enter a notification message.",
    },
  },
  ar: {
    labels: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      level: "المستوى",
      group: "المجموعة",
      actions: "الإجراءات",
      unapprovedStudents: "الطلاب غير المعتمدين",
      viewDocs: "عرض المستندات",
      accept: "قبول",
      reject: "رفض",
      sendNotification: "إرسال إشعار",
      typeMessage: "اكتب رسالتك...",
      missingDocs: "مستندات مفقودة",
      underReview: "الطلب قيد المراجعة",
      send: "إرسال",
    },
    success: {
      loadData: "تم تحميل البيانات بنجاح!",
      updateStudent: "تم تحديث الطالب بنجاح!",
      notificationSent: "تم إرسال الإشعار إلى الطالب",
    },
    errors: {
      loadDataFailed: "فشل في تحميل البيانات.",
      updateStudentFailed: "فشل في تحديث الطالب.",
      notificationFailed: "فشل في إرسال الإشعار.",
      emptyNotification: "يرجى إدخال رسالة إشعار.",
    },
  },
};

export default function UnapprovedStudents() {
  const [students, setStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector((state) => state.auth.accessToken);
  const language = "fr"; // Change dynamically if needed
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsData, levelsData, groupsData] = await Promise.all([
          getStudents(),
          getLevels(),
          getGroups(),
        ]);
        setStudents(studentsData || []);
        setLevels(levelsData || []);
        setGroups(groupsData || []);
      } catch {
        message.error(t.errors.loadDataFailed);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const getStudents = async () => {
    try {
      const response = await apiCall(
        "get",
        "/api/students/?is_approved=0",
        null,
        { token }
      );
      message.success(t.success.loadData);
      return response.students || response;
    } catch {
      message.error(t.errors.loadDataFailed);
      throw new Error();
    }
  };

  const updateStudent = async (id, values) => {
    try {
      await apiCall("patch", `/api/students/${id}/approval`, values, { token });
      message.success(t.success.updateStudent);
    } catch {
      message.error(t.errors.updateStudentFailed);
      throw new Error();
    }
  };

  const getLevels = async () => {
    const response = await apiCall("get", "/api/levels/", null, { token });
    return response.levels || response;
  };

  const getGroups = async () => {
    const response = await apiCall("get", "/api/groups/", null, { token });
    return response.groups || response;
  };

  const getLevelName = (id) => levels.find((l) => l.id === id)?.name || "—";
  const getGroupName = (id) => groups.find((g) => g.id === id)?.name || "—";

  const openPdf = (url) => {
    setPdfFile(
      url ||
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    );
    setPdfDialogOpen(true);
  };

  const openNotify = (studentId) => {
    setSelectedStudentId(studentId);
    setNotifyDialogOpen(true);
  };

  const sendNotification = async () => {
    if (!notificationText.trim()) {
      message.error(t.errors.emptyNotification);
      return;
    }
    try {
      await apiCall(
        "post",
        "/api/notifications/",
        {
          student_id: selectedStudentId,
          message: notificationText,
        },
        { token }
      );

      message.success(`${t.success.notificationSent} ${selectedStudentId}`);
      setNotifyDialogOpen(false);
      setNotificationText("");
      setSelectedStudentId(null);
    } catch {
      message.error(t.errors.notificationFailed);
    }
  };

  const handleAccept = async (id) => {
    await updateStudent(id, { is_approved: true });
    const updated = await getStudents();
    setStudents(updated);
  };

  const handleReject = async (id) => {
    await updateStudent(id, { is_approved: false });
    const updated = await getStudents();
    setStudents(updated);
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: "docs",
        label: (
          <span>
            <FilePdfOutlined className="mr-2" />
            {t.labels.viewDocs}
          </span>
        ),
        onClick: () => openPdf(record.docs_url),
      },
      {
        key: "accept",
        label: (
          <span>
            <CheckOutlined className="mr-2 text-green-600" />
            {t.labels.accept}
          </span>
        ),
        onClick: () => handleAccept(record.id),
      },
      {
        key: "reject",
        label: (
          <span>
            <CloseOutlined className="mr-2 text-red-600" />
            {t.labels.reject}
          </span>
        ),
        onClick: () => handleReject(record.id),
      },
      {
        key: "notify",
        label: (
          <span>
            <BellOutlined className="mr-2" />
            {t.labels.sendNotification}
          </span>
        ),
        onClick: () => openNotify(record.id),
      },
    ],
  });

  const columns = [
    {
      title: t.labels.name,
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: t.labels.email,
      dataIndex: "email",
      key: "email",
    },
    {
      title: t.labels.level,
      render: (_, record) => getLevelName(record.level_id),
    },
    {
      title: t.labels.group,
      render: (_, record) => getGroupName(record.group_id),
    },
    {
      title: t.labels.actions,
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{t.labels.unapprovedStudents}</h1>
      <Table
        columns={columns}
        dataSource={students.filter(
          (s) => !s.is_approved && s.is_active !== false
        )}
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{ pageSize: 50, showSizeChanger: true }}
      />

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <iframe src={pdfFile} className="w-full h-full" title="Student PDF" />
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.labels.sendNotification}</DialogTitle>
            <DialogDescription>ID: {selectedStudentId}</DialogDescription>
          </DialogHeader>
          <ShadcnInput
            placeholder={t.labels.typeMessage}
            value={notificationText}
            onChange={(e) => setNotificationText(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <ShadcnButton
              variant="outline"
              onClick={() => setNotificationText(t.labels.missingDocs)}
            >
              {t.labels.missingDocs}
            </ShadcnButton>
            <ShadcnButton
              variant="outline"
              onClick={() => setNotificationText(t.labels.underReview)}
            >
              {t.labels.underReview}
            </ShadcnButton>
            <ShadcnButton onClick={sendNotification}>
              {t.labels.send}
            </ShadcnButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
