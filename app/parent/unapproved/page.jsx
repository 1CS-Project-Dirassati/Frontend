"use client";

import { useState } from "react";
import { Table, Dropdown, Button } from "antd";
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

import {
  getStudents,
  getLevels,
  getGroups,
  updateStudent,
} from "../data/studentsData";

export default function UnapprovedStudents() {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [_, setRefresh] = useState(0); // trigger re-render

  const unapprovedStudents = getStudents().filter((s) => !s.is_approved);
  const levels = getLevels();
  const groups = getGroups();

  const getLevelName = (id) => levels.find((l) => l.id === id)?.name || "—";
  const getGroupName = (id) => groups.find((g) => g.id === id)?.name || "—";

  const openPdf = (url) => {
    setPdfFile(url);
    setPdfDialogOpen(true);
  };

  const openNotify = (studentId) => {
    setSelectedStudentId(studentId);
    setNotifyDialogOpen(true);
  };

  const sendNotification = () => {
    alert(`Sent to student ${selectedStudentId}: ${notificationText}`);
    setNotifyDialogOpen(false);
    setNotificationText("");
  };

  const handleAccept = (id) => {
    updateStudent(id, { is_approved: true });
    setRefresh((r) => r + 1); // force re-render
  };

  const handleReject = (id) => {
    updateStudent(id, { is_approved: false });
    setRefresh((r) => r + 1); // force re-render
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
        onClick: () =>
          openPdf(
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          ),
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
