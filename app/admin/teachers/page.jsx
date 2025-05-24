// filepath: app/admin/teachers/page.jsx
"use client";
import { Table } from "antd";
import { getTeachers } from "../../admin_test/data/studentsData";

export default function Teachers() {
  const data = getTeachers();
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Name",
      key: "name",
      render: (_, rec) => `${rec.first_name} ${rec.last_name}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
  ];
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Teachers</h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
