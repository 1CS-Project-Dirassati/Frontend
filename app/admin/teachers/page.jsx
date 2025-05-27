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
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();

  const fetchTeachers = async (page = currentPage, perPage = pageSize) => {
    setLoading(true);
    try {
      const res = await apiCall(
        "get",
        `/api/teachers/?page=${page}&per_page=${perPage}`,
        null,
        { token }
      );

      const teacherList = res.teachers || res.results || [];
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
      setTotalTeachers(res.total || res.count || 0);
    } catch {
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
      fetchTeachers(currentPage, pageSize);
      fetchModules();
    }
  }, [token, currentPage, pageSize]);

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

      const {
        first_name,
        last_name,
        phone_number,
        address,
        profile_picture,
        modules,
      } = values;

      const payload = {
        first_name,
        last_name,
        phone_number,
        address,
        profile_picture,
      };

      await apiCall("put", `/api/teachers/${selectedTeacher.id}`, payload, {
        token,
      });

      if (Array.isArray(modules)) {
        await syncModules(selectedTeacher.id, modules);
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

      // Destructure the exact fields expected by the API
      const {
        email,
        password,
        phone_number,
        first_name,
        last_name,
        address,
        profile_picture,
        modules,
      } = values;

      // Construct only the allowed payload
      const payload = {
        email,
        password,
        phone_number,
        first_name,
        last_name,
        address,
        profile_picture,
      };

      const newTeacher = await apiCall("post", `/api/teachers/`, payload, {
        token,
      });

      // Now sync modules only if they exist
      if (Array.isArray(modules) && newTeacher.id) {
        await Promise.all(
          modules.map((id) =>
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
    } catch (err) {
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
      title: "Profile",
      dataIndex: "profile_picture",
      key: "profile_picture",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          "N/A"
        ),
    },
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
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalTeachers,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1000 }}
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
          <Form.Item name="profile_picture" label="Profile Picture URL">
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
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            <AntInput.Password />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <AntInput />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <AntInput />
          </Form.Item>
          <Form.Item
            name="profile_picture"
            label="Profile Picture URL"
            rules={[{ required: true }]}
          >
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
