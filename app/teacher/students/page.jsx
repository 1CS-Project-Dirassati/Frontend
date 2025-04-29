"use client";

import { useState } from "react";
import { Table, Dropdown, Button, Form, Select as AntSelect } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input as ShadcnInput } from "@/components/ui/input";

import {
  getStudents,
  getParents,
  updateStudent,
  deleteStudent,
} from "../data/studentsData";

const { Option } = AntSelect;

export default function Students() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [data, setData] = useState(getStudents());
  const [parents, setParents] = useState(getParents());
  const router = useRouter();

  const getParentName = (parent_id) => {
    const parent = parents.find((p) => p.id === parent_id);
    return parent ? `${parent.first_name} ${parent.last_name}` : "N/A";
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: "view",
        label: (
          <span>
            <EyeOutlined className="mr-2" />
            View
          </span>
        ),
        onClick: () => router.push(`/admin_test/studentProfile/${record.id}`),
      },
      {
        key: "edit",
        label: (
          <span>
            <EditOutlined className="mr-2" />
            Edit
          </span>
        ),
        onClick: () => {
          setEditingStudent(record);
          form.setFieldsValue(record);
          setIsModalOpen(true);
        },
      },
      {
        key: "delete",
        label: (
          <span>
            <DeleteOutlined className="mr-2" />
            Delete
          </span>
        ),
        onClick: () => {
          deleteStudent(record.id);
          setData(getStudents());
        },
      },
    ],
  });

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Parent",
      key: "parent",
      render: (_, record) => getParentName(record.parent_id),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={actionMenu(record)}
          trigger={["click"]}
          overlayClassName="shadow-md rounded-md"
        >
          <Button
            icon={<MoreOutlined />}
            className="border-border hover:bg-secondary hover:text-text"
          />
        </Dropdown>
      ),
    },
  ];

  const handleOk = () => {
    form.validateFields().then((values) => {
      updateStudent(editingStudent.id, values);
      setData(getStudents());
      setIsModalOpen(false);
      form.resetFields();
      setEditingStudent(null);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingStudent(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-text">Students</h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        bordered
        className="shadow-md bg-background rounded-lg"
        rowClassName="hover:bg-accent/10"
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-background text-text rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <AntSelect className="w-full">
                <Option value="M">Male</Option>
                <Option value="F">Female</Option>
              </AntSelect>
            </Form.Item>
            <Form.Item
              name="date_of_birth"
              label="Date of Birth"
              rules={[
                { required: true, message: "Please enter date of birth" },
              ]}
            >
              <ShadcnInput type="date" className="border-border" />
            </Form.Item>
            <div className="flex gap-2 justify-end">
              <ShadcnButton
                variant="outline"
                onClick={handleCancel}
                className="border-border hover:bg-accent"
              >
                Cancel
              </ShadcnButton>
              <ShadcnButton
                onClick={handleOk}
                className="bg-secondary hover:bg-accent text-background"
              >
                Save
              </ShadcnButton>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
