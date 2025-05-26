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
import apiCall from "@/components/utils/apiCall"; // Import apiCall (adjust path as needed)

// Translation object (based on StudentsGroups component)
const translations = {
  fr: {
    success: {
      loadData: "Données chargées avec succès !",
      updateStudent: "Étudiant mis à jour avec succès !",
    },
    errors: {
      loadDataFailed: "Échec du chargement des données.",
      updateStudentFailed: "Échec de la mise à jour de l'étudiant.",
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
        "/api/students/?is_approved=0",
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

  const unapprovedStudents = students.filter(
    (s) => !s.is_approved && s.is_active !== false
  );

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
      message.error("Please enter a notification message.");
      return;
    }
    try {
      // Placeholder: Replace with actual API call to send notification
      await apiCall(
        "post",
        `/api/notifications/`,
        {
          student_id: selectedStudentId,
          message: notificationText,
        },
        { token }
      );
      message.success(`Notification sent to student ${selectedStudentId}`);
      setNotifyDialogOpen(false);
      setNotificationText("");
      setSelectedStudentId(null);
    } catch (error) {
      console.error("Failed to send notification:", error);
      message.error("Failed to send notification.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await updateStudent(id, { is_approved: true });
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Failed to accept student:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateStudent(id, { is_approved: false });
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Failed to reject student:", error);
    }
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: "docs",
        label: (
          <span>
            <FilePdfOutlined className="mr-2" />
            View Documents
          </span>
        ),
        onClick: () => openPdf(record.docs_url),
      },
      {
        key: "accept",
        label: (
          <span>
            <CheckOutlined className="mr-2 text-green-600" />
            Accept
          </span>
        ),
        onClick: () => handleAccept(record.id),
      },
      {
        key: "reject",
        label: (
          <span>
            <CloseOutlined className="mr-2 text-red-600" />
            Reject
          </span>
        ),
        onClick: () => handleReject(record.id),
      },
      {
        key: "notify",
        label: (
          <span>
            <BellOutlined className="mr-2" />
            Send Notification
          </span>
        ),
        onClick: () => openNotify(record.id),
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
      <h1 className="text-2xl font-bold mb-6">Unapproved Students</h1>
      <Table
        columns={columns}
        dataSource={unapprovedStudents}
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
          <iframe src={pdfFile} className="w-full h-full" title="Student PDF" />
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              To student ID: {selectedStudentId}
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
                setNotificationText("Please upload your documents.")
              }
            >
              Missing Docs
            </ShadcnButton>
            <ShadcnButton
              variant="outline"
              onClick={() =>
                setNotificationText("Your request is under review.")
              }
            >
              Under Review
            </ShadcnButton>
            <ShadcnButton onClick={sendNotification}>Send</ShadcnButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
