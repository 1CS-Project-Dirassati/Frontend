"use client";

import { useState, useEffect } from "react";
import { Button, Card, Table, Space, Select, message, Tag } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
// import apiCall from "@/components/utils/apiCall"; // Assuming you have this utility

// Mock data - replace with API calls
const mockLevels = [
  { id: "1", name: "1st Year" },
  { id: "2", name: "2nd Year" },
  { id: "3", name: "3rd Year" },
];

const mockSchedules = {
  1: [
    {
      id: "g1s1",
      levelId: "1",
      levelName: "1st Year",
      groupName: "Group A",
      trimesterName: "Trimester 1",
      status: "Published",
    },
    {
      id: "g2s1",
      levelId: "1",
      levelName: "1st Year",
      groupName: "Group B",
      trimesterName: "Trimester 1",
      status: "Draft",
    },
  ],
  2: [
    {
      id: "g3s2",
      levelId: "2",
      levelName: "2nd Year",
      groupName: "Group C",
      trimesterName: "Trimester 2",
      status: "Published",
    },
  ],
  3: [],
};

const AdminSchedulePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (selectedLevel) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setSchedules(mockSchedules[selectedLevel] || []);
        setLoading(false);
      }, 500);
    } else {
      setSchedules([]);
    }
  }, [selectedLevel]);

  const handleCreateSchedule = () => {
    router.push("/admin/schedule/create");
  };

  const handleViewSchedule = (record) => {
    // For now, log to console. Replace with actual navigation or modal display.
    console.log("View schedule:", record);
    message.info(
      `Viewing schedule for ${record.groupName} - ${record.trimesterName}`
    );
    // Example: router.push(`/admin/schedule/view/${record.id}`);
  };

  const handleEditSchedule = (record) => {
    console.log("Edit schedule:", record);
    message.info(`Editing schedule for ${record.groupName}`);
    // Example: router.push(`/admin/schedule/edit/${record.id}`);
  };

  const handleDeleteSchedule = (record) => {
    console.log("Delete schedule:", record);
    // Add confirmation modal before deleting
    message.success(`Schedule for ${record.groupName} deleted (mock)`);
    setSchedules((prev) => prev.filter((s) => s.id !== record.id));
  };

  const columns = [
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
    },
    {
      title: "Level",
      dataIndex: "levelName",
      key: "levelName",
    },
    {
      title: "Trimester",
      dataIndex: "trimesterName",
      key: "trimesterName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Published" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewSchedule(record)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSchedule(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteSchedule(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card bordered={false} className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Schedule Management
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateSchedule}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create New Schedule
          </Button>
        </div>

        <div className="mb-6">
          <Select
            placeholder="Select Level to View Schedules"
            style={{ width: 300 }}
            onChange={(value) => setSelectedLevel(value)}
            allowClear
            size="large"
          >
            {mockLevels.map((level) => (
              <Select.Option key={level.id} value={level.id}>
                {level.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          bordered
          className="shadow-md rounded-lg"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default AdminSchedulePage;
