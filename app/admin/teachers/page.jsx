"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Dropdown,
  Button,
  Form,
  Modal,
  message,
  Select,
  Input as AntInput,
} from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import { useRouter } from "next/navigation";

export default function Teachers() {
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        "get",
        "/api/teachers/?page=1&per_page=100",
        null,
        { token }
      );
      const teacherList = res.teachers || res.data || [];

      // Fetch their modules
      const enrichedTeachers = await Promise.all(
        teacherList.map(async (teacher) => {
          const modRes = await apiCall(
            "get",
            `/api/modules/?teacher_id=${teacher.id}`,
            null,
            { token }
          );
          return { ...teacher, modules: modRes.modules || [] };
        })
      );
      setTeachers(enrichedTeachers);
    } catch (err) {
      message.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await apiCall("get", "/api/modules/", null, { token });
      setModules(res.modules || res.data || []);
    } catch {
      message.error("Failed to load modules");
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeachers();
      fetchModules();
    }
  }, [token]);

  const handleEdit = (record) => {
    setSelectedTeacher(record);
    form.setFieldsValue({
      ...record,
      modules: record.modules?.map((mod) => mod.id),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiCall("delete", `/api/teachers/${id}`, null, { token });
      message.success("Teacher deleted");
      fetchTeachers();
    } catch {
      message.error("Failed to delete teacher");
    }
  };

  const syncModules = async (teacherId, newModuleIds) => {
    const oldModuleIds = selectedTeacher?.modules?.map((m) => m.id) || [];

    const toAdd = newModuleIds.filter((id) => !oldModuleIds.includes(id));
    const toRemove = oldModuleIds.filter((id) => !newModuleIds.includes(id));

    try {
      await Promise.all([
        ...toAdd.map((id) =>
          apiCall("post", `/api/modules/${id}/teachers/${teacherId}`, null, {
            token,
          })
        ),
        ...toRemove.map((id) =>
          apiCall("delete", `/api/modules/${id}/teachers/${teacherId}`, null, {
            token,
          })
        ),
      ]);
    } catch {
      message.error("Error syncing modules");
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await apiCall("put", `/api/teachers/${selectedTeacher.id}`, values, {
        token,
      });

      if (Array.isArray(values.modules)) {
        await syncModules(selectedTeacher.id, values.modules);
      }

      message.success("Teacher updated");
      setIsEditModalOpen(false);
      fetchTeachers();
    } catch {
      message.error("Update failed");
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newTeacher = await apiCall("post", `/api/teachers/`, values, {
        token,
      });

      if (Array.isArray(values.modules) && newTeacher.id) {
        await Promise.all(
          values.modules.map((id) =>
            apiCall(
              "post",
              `/api/modules/${id}/teachers/${newTeacher.id}`,
              null,
              { token }
            )
          )
        );
      }

      message.success("Teacher created");
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchTeachers();
    } catch {
      message.error("Failed to create teacher");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Name",
      key: "name",
      render: (_, rec) => `${rec.first_name} ${rec.last_name}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Modules",
      key: "modules",
      render: (_, rec) =>
        rec.modules?.map((m) => m.name).join(", ") || "No modules",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: (
                  <span>
                    <EyeOutlined /> View
                  </span>
                ),
                onClick: () => router.push(`/admin/teacherProfile/${rec.id}`),
              },
              {
                key: "edit",
                label: (
                  <span>
                    <EditOutlined /> Edit
                  </span>
                ),
                onClick: () => handleEdit(rec),
              },
              {
                key: "delete",
                label: (
                  <span className="text-red-500">
                    <DeleteOutlined /> Delete
                  </span>
                ),
                onClick: () => handleDelete(rec.id),
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
    <div className="p-4 sm:p-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Teachers</h1>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => {
            setIsCreateModalOpen(true);
            form.resetFields();
          }}
        >
          Add Teacher
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdate}
        title="Edit Teacher"
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <AntInput />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <AntInput />
          </Form.Item>
          <Form.Item name="modules" label="Modules">
            <Select
              mode="multiple"
              allowClear
              options={modules.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreate}
        title="Add New Teacher"
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", required: true }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <AntInput />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <AntInput />
          </Form.Item>
          <Form.Item name="modules" label="Modules">
            <Select
              mode="multiple"
              allowClear
              options={modules.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
