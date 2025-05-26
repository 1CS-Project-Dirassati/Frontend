"use client";

import { useState, useEffect } from "react";
import { Table, Form, Input, Select, Button, message, Card } from "antd";
import apiCall from "../../../components/utils/apiCall";
import { useSelector } from "react-redux";

export default function Modules() {
  const [form] = Form.useForm();
  const [levels, setLevels] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const accesstoken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    fetchLevels();
    fetchModules(pagination.current, pagination.pageSize);
  }, []);

  const fetchLevels = async () => {
    try {
      const levelsResponse = await apiCall(
        "get",
        `/api/levels/?page=1&per_page=100`,
        null,
        {
          token,
        }
      );
      setLevels(levelsResponse.levels || levelsResponse);
    } catch (error) {
    //  message.error("Failed to fetch levels");
    }
  };

  const fetchModules = async (page, pageSize) => {
    try {
      setLoading(true);
      const response = await apiCall(
        "get",
        `/api/modules/?page=${page}&per_page=${pageSize}`,
        null,
        { token }
      );

      // If API returns shape: { data: [...], total: number }
      setModules(response.modules);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: response.total,
      }));
    } catch (error) {
    //  message.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    fetchModules(pagination.current, pagination.pageSize);
  };

  const onFinish = async (values) => {
    try {
      const newModule = {
        name: values.name,
        level_id: values.level_id,
      };
      await apiCall("post", "/api/modules", newModule, { token });
      message.success("Module created");

      // Re-fetch current page
      fetchModules(pagination.current, pagination.pageSize);
      form.resetFields();
    } catch (error) {
      message.error("Failed to create module");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiCall("delete", `/api/modules/${id}`, null, { token });
      message.success("Module removed");

      // Re-fetch current page
      fetchModules(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Failed to delete module");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Level",
      key: "level",
      render: (_, rec) => levels.find((l) => l.id === rec.level_id)?.name,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Button danger onClick={() => handleDelete(rec.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Modules Management</h1>
      <Card>
        <Form form={form} layout="inline" onFinish={onFinish} className="mb-4">
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please enter module name" }]}
          >
            <Input placeholder="Module Name" />
          </Form.Item>
          <Form.Item
            name="level_id"
            rules={[{ required: true, message: "Select level" }]}
          >
            <Select placeholder="Select Level" style={{ width: 200 }}>
              {levels.map((lvl) => (
                <Select.Option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Module
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={modules}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onChange={handleTableChange}
          bordered
        />
      </Card>
    </div>
  );
}
