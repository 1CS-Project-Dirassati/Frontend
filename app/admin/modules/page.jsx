"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Row,
  Col,
} from "antd";
import apiCall from "../../../components/utils/apiCall";
import { useSelector } from "react-redux";

export default function Modules() {
  const [form] = Form.useForm();
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const accesstoken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (token) {
      fetchLevels();
      fetchSemesters();
      fetchModules(pagination.current, pagination.pageSize);
    }
  }, [token]);

  const fetchLevels = async () => {
    try {
      const res = await apiCall(
        "get",
        "/api/levels/?page=1&per_page=100",
        null,
        {
          token,
        }
      );
      setLevels(res.levels || res.data || []);
    } catch {
      message.error("Failed to fetch levels");
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await apiCall(
        "get",
        "/api/semesters/?page=1&per_page=100",
        null,
        {
          token,
        }
      );
      setSemesters(res.semesters || res.data || []);
    } catch {
      message.error("Failed to fetch semesters");
    }
  };

  const fetchModules = async (page, pageSize) => {
    try {
      setLoading(true);
      const res = await apiCall(
        "get",
        `/api/modules/?page=${page}&per_page=${pageSize}`,
        null,
        {
          token,
        }
      );

      setModules(res.modules || res.data || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: res.total || res.modules?.length || 0,
      }));
    } catch {
      message.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        level_id: values.level_id,
        semester_id: values.semester_id,
      };

      await apiCall("post", "/api/modules/", payload, { token });
      message.success("Module created");
      form.resetFields();
      fetchModules(pagination.current, pagination.pageSize);
    } catch {
      message.error("Failed to create module");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiCall("delete", `/api/modules/${id}`, null, { token });
      message.success("Module deleted");
      fetchModules(pagination.current, pagination.pageSize);
    } catch {
      message.error("Failed to delete module");
    }
  };

  const handleTableChange = (pagination) => {
    fetchModules(pagination.current, pagination.pageSize);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Level",
      key: "level",
      render: (_, rec) =>
        levels.find((lvl) => lvl.id === rec.level_id)?.name || "—",
    },
    {
      title: "Semester",
      key: "semester",
      render: (_, rec) =>
        semesters.find((s) => s.id === rec.semester_id)?.name || "—",
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Module Management</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title="Add Module" bordered>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Module Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter module name" },
                ]}
              >
                <Input placeholder="Enter module name" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <Input.TextArea placeholder="Enter module description" />
              </Form.Item>

              <Form.Item
                label="Level"
                name="level_id"
                rules={[{ required: true, message: "Please select a level" }]}
              >
                <Select placeholder="Select level">
                  {levels.map((lvl) => (
                    <Select.Option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Semester"
                name="semester_id"
                rules={[
                  { required: true, message: "Please select a semester" },
                ]}
              >
                <Select placeholder="Select semester">
                  {semesters.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Create Module
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card title="Existing Modules" bordered>
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
              scroll={{ x: true }}
              bordered
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
