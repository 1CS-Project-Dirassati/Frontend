"use client";

import { useState } from "react";
import { Table, Dropdown, Button, Form } from "antd";
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
  getParents,
  updateParent,
  deleteParent,
  getParentStudents,
} from "../data/studentsData";

export default function Parents() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [data, setData] = useState(getParents());
  const router = useRouter();

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
        onClick: () => router.push(`/admin_test/parentProfile/${record.id}`),
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
          setEditingParent(record);
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
          deleteParent(record.id);
          setData(getParents());
        },
      },
    ],
  });

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Children",
      key: "children",
      render: (_, record) => (
        <ShadcnButton
          variant="ghost"
          className="text-blue-600 hover:bg-accent"
          onClick={() => {
            const students = getParentStudents(record.id);
            setSelectedStudents(students);
            setStudentDialogOpen(true);
          }}
        >
          View ({getParentStudents(record.id).length})
        </ShadcnButton>
      ),
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
      updateParent(editingParent.id, values);
      setData(getParents());
      setIsModalOpen(false);
      form.resetFields();
      setEditingParent(null);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingParent(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-text">Parents</h1>
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

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-background text-text rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
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
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Please enter a phone number" },
              ]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <ShadcnInput className="border-border" />
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

      {/* Student Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="bg-background text-text rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Children</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {selectedStudents.length === 0 ? (
              <p className="text-muted-foreground">No children assigned.</p>
            ) : (
              selectedStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() =>
                    router.push(`/admin_test/studentProfile/${student.id}`)
                  }
                  className="cursor-pointer p-3 rounded-lg border hover:bg-accent transition-colors duration-200"
                >
                  <p className="font-medium text-sm">
                    {student.first_name} {student.last_name}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
