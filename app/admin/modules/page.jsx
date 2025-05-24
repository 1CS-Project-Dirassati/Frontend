// filepath: app/admin/modules/page.jsx
"use client";

import { useState } from "react";
import { Table, Form, Input, Select, Button, message, Card } from "antd";
import { getLevels } from "../../admin_test/data/studentsData";
// import apiCall from "../../../components/utils/apiCall"; // Uncomment for real API

export default function Modules() {
  const [form] = Form.useForm();
  const levels = getLevels();
  const [modules, setModules] = useState([
    { id: 1, name: "Mathematics", level_id: 1 },
    { id: 2, name: "Physics", level_id: 10 },
  ]);

  const onFinish = (values) => {
    const newModule = {
      id: Date.now(),
      name: values.name,
      level_id: values.level_id,
    };
    setModules((prev) => [...prev, newModule]);
    message.success("Module created");
    form.resetFields();
    // apiCall('post', '/api/modules', newModule)
    //   .then(() => message.success('Module saved'))
    //   .catch(() => message.error('Save failed'));
  };

  const handleDelete = (id) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    message.success("Module removed");
    // apiCall('delete', `/api/modules/${id}`)
    //   .then(() => setModules(getFromApi()))
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
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
}
