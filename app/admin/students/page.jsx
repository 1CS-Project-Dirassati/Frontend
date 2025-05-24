// filepath: app/admin/students/page.jsx
"use client";
import { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { useRouter } from "next/navigation";
// import apiCall from '../../../components/utils/apiCall';
import { students as mockStudents } from "../../admin_test/data/studentsData";

export default function Students() {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Replace with real API call:
    // apiCall('get', '/api/students').then(res => setData(res));
    setData(mockStudents);
  }, []);

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, rec) => `${rec.first_name} ${rec.last_name}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Group", dataIndex: "group_id", key: "group_id" },
    {
      title: "Approved",
      key: "approved",
      render: (_, rec) => (rec.is_approved ? "Yes" : "No"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => {
        return (
          <Button
            type="link"
            onClick={() => router.push(`/admin/students/${rec.id}`)}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Students</h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
