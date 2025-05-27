"use client";

import { useEffect, useState } from "react";
import { Table, Select, Button, message, Dropdown } from "antd";
import { EyeOutlined, UndoOutlined, MoreOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import apiCall from "@/components/utils/apiCall";

const roleToApiPath = {
  student: "/api/students/?archived=1",
  teacher: "/api/teachers/?archived=1",
  parent: "/api/parents/?archived=1",
};

const roleToUnarchivePath = {
  student: (id) => `/api/students/${id}/unarchive`,
  teacher: (id) => `/api/teachers/${id}/unarchive`,
  parent: (id) => `/api/parents/${id}/unarchive`,
};

const ArchivedUsers = () => {
  const token = useSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const [role, setRole] = useState("student");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const response = await apiCall("get", roleToApiPath[role], null, {
        token,
      });
      setUsers(response.results || response[role + "s"] || []);
    } catch (error) {
      message.error("Failed to fetch archived users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleUnarchive = async (userId) => {
    const url = roleToUnarchivePath[role](userId);
    try {
      await apiCall("post", url, null, { token });
      message.success("User unarchived successfully.");
      fetchUsers();
    } catch (error) {
      message.error("Failed to unarchive user.");
    }
  };

  const columns = [
    {
      title: "Name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: (
                  <span>
                    <EyeOutlined className="mr-2" />
                    View
                  </span>
                ),
                onClick: () =>
                  router.push(`/admin/${role}Profile/${record.id}`),
              },
              {
                key: "unarchive",
                label: (
                  <span className="text-green-600">
                    <UndoOutlined className="mr-2" />
                    Unarchive
                  </span>
                ),
                onClick: () => handleUnarchive(record.id),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Archived Users
      </h1>

      <div className="mb-4 flex gap-4 items-center">
        <span className="font-medium">Filter by Role:</span>
        <Select
          value={role}
          onChange={setRole}
          style={{ width: 200 }}
          options={[
            { label: "Student", value: "student" },
            { label: "Teacher", value: "teacher" },
            { label: "Parent", value: "parent" },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        bordered
        className="shadow-md bg-white rounded-lg"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ArchivedUsers;
