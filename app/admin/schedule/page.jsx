"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Table, Card, Button, Space, message } from "antd";
import { EyeOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import apiCall from "@/components/utils/apiCall";

const AdminSchedulePage = () => {
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    router.push("/admin/schedule/create");
  };

  const handleView = (groupId, semesterId) => {
    router.push(`/admin/schedule/view/${groupId}/${semesterId}`);
  };

  const handleEdit = (groupId) => {
    router.push(`/admin/schedule/edit/${groupId}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all sessions
        const sessionRes = await apiCall("get", "/api/sessions/?per_page=1000", null, {
          token,
        });
        const sessions = sessionRes.sessions || [];

        // 2. Extract unique group and semester IDs
        const uniqueGroupIds = [...new Set(sessions.map((s) => s.group_id))];
        const uniqueSemesterIds = [
          ...new Set(sessions.map((s) => s.semester_id)),
        ];

        // 3. Fetch each group individually
        const groupMap = {};
        for (const groupId of uniqueGroupIds) {
          try {
            const res = await apiCall("get", `/api/groups/${groupId}`, null, {
              token,
            });
            groupMap[groupId] = res.group;
          } catch {
            message.warning(`Failed to load group ${groupId}`);
          }
        }

        // 4. Fetch each semester (trimester) individually
        const semesterMap = {};
        for (const semesterId of uniqueSemesterIds) {
          try {
            const res = await apiCall(
              "get",
              `/api/semesters/${semesterId}`,
              null,
              { token }
            );
            semesterMap[semesterId] = res.semester;
          } catch {
            message.warning(`Failed to load trimester ${semesterId}`);
          }
        }

        // 5. Build unique row entries
        const seen = new Set();
        const rowData = [];

        sessions.forEach((session) => {
          const group = groupMap[session.group_id];
          const semester = semesterMap[session.semester_id];
          const key = `${session.group_id}-${session.semester_id}`;

          if (!seen.has(key) && group && semester) {
            seen.add(key);
            rowData.push({
              key,
              group,
              semester,
            });
          }
        });

        setRows(rowData);
      } catch (err) {
        console.error(err);
        message.error("Failed to load schedule data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const columns = [
    {
      title: "Group",
      dataIndex: ["group", "name"],
      key: "group",
    },
    {
      title: "Level",
      dataIndex: ["group", "level", "name"],
      key: "level",
    },
    {
      title: "Trimester",
      dataIndex: ["semester", "name"],
      key: "semester",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record.group.id, record.semester.id)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.group.id)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card variant={false} className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Schedule Management
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
            className="bg-accent hover:bg-accent-light"
          >
            Create New Schedule
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={rows}
          loading={loading}
          bordered
          className="shadow-md rounded-lg"
          pagination={{ pageSize: 10 }}
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default AdminSchedulePage;
