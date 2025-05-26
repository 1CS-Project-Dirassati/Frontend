"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Table, Card, Button, Space, Select, message } from "antd";
import { EyeOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import apiCall from "@/components/utils/apiCall";

const AdminSchedulePage = () => {
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);

  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await apiCall("get", "/api/levels/", null, { token });
        setLevels(response.levels || []);
      } catch (err) {
        message.error("Failed to load levels.");
      }
    };

    fetchLevels();
  }, [token]);

  // Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        let url = "/api/groups/";
        if (selectedLevel) {
          url += `?level_id=${selectedLevel}`;
        }

        const response = await apiCall("get", url, null, { token });
        setGroups(response.groups || []);
      } catch (err) {
        message.error("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [selectedLevel, token]);

  const handleCreate = () => {
    router.push("/admin/schedule/create");
  };

  const handleView = (groupId) => {
    router.push(`/admin/schedule/view/${groupId}`);
  };

  const handleEdit = (groupId) => {
    router.push(`/admin/schedule/edit/${groupId}`);
  };

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Level",
      dataIndex: ["level", "name"],
      key: "level",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Edit
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
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create New Schedule
          </Button>
        </div>

        <div className="mb-6">
          <Select
            placeholder="Filter by Level"
            style={{ width: 300 }}
            onChange={(value) => setSelectedLevel(value)}
            allowClear
            size="large"
          >
            {levels.map((level) => (
              <Select.Option key={level.id} value={level.id}>
                {level.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          loading={loading}
          bordered
          className="shadow-md rounded-lg"
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  );
};

export default AdminSchedulePage;
