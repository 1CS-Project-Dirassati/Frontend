"use client";

import React, { useState, useEffect } from "react";
import { Table, Checkbox, Button, message, Card, Spin } from "antd";
import { useSearchParams } from "next/navigation";
import apiCall from "../../../components/utils/apiCall";

const TeacherAttendancePage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const groupId = searchParams.get("groupId");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch students for the session and group from URL
  useEffect(() => {
    if (sessionId && groupId) {
      setLoading(true);
      // Static mock data; replace with real API call:
      const mockData = [
        { id: "stu1", name: "Alice" },
        { id: "stu2", name: "Bob" },
        { id: "stu3", name: "Charlie" },
      ];
      setStudents(mockData.map((s) => ({ ...s, present: true })));
      // Example real fetch:
      // apiCall('get', `/api/sessions/${sessionId}/students?groupId=${groupId}`)
      //   .then(res => setStudents(res.map(s => ({ ...s, present: true })))))
      setLoading(false);
    }
  }, [sessionId, groupId]);

  const handleAttendanceChange = (studentId, isPresent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, present: isPresent } : s))
    );
  };

  const handleSubmit = () => {
    const absentees = students.filter((s) => !s.present).map((s) => s.id);
    const attendanceData = { sessionId, groupId, absentees };
    console.log("Submitting attendance:", attendanceData);
    setSubmitting(true);
    // Real POST request:
    // apiCall('post', `/api/sessions/${sessionId}/attendance`, attendanceData)
    //   .then(() => message.success('Attendance saved'))
    //   .catch(() => message.error('Submit failed'))
    //   .finally(() => setSubmitting(false));
    setTimeout(() => {
      message.success("Attendance submitted");
      setSubmitting(false);
    }, 1000);
  };

  const studentColumns = [
    { title: "Student ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Present",
      key: "present",
      render: (_, record) => (
        <Checkbox
          checked={record.present}
          onChange={(e) => handleAttendanceChange(record.id, e.target.checked)}
        />
      ),
    },
  ];

  // Render
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  return (
    <Card title={`Attendance: ${sessionId}`}>
      <Table
        dataSource={students}
        columns={studentColumns}
        rowKey="id"
        pagination={false}
        bordered
      />
      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        disabled={students.length === 0}
        style={{ marginTop: 16 }}
      >
        Submit Attendance
      </Button>
    </Card>
  );
};
export default TeacherAttendancePage;
