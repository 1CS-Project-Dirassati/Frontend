"use client";
import React, { useEffect, useState } from "react";
import { Table, Select, Card, Spin } from "antd";
import apiCall from "../../../components/utils/apiCall"; // Adjust the import path as necessary
import { useSelector } from "react-redux";

const { Option } = Select;

const SeeNote = () => {
  const token = useSelector((state) => state.auth.accessToken);
  const children = useSelector((state) => state.userinfo.userProfile);

  const [selectedType, setSelectedType] = useState("EXAM1"); // Set default type to EXAM1
  const [loading, setLoading] = useState(true); // Add loading state
  const [notes, setNotes] = useState([]); // State to hold notes

  useEffect(() => {
    const fetchData = async () => {
      if (!children?.id) {
        setLoading(false);
        return;
      }
      try {
        const result = await apiCall(
          "get",
          `/api/notes/?student_id=${children.id}&page=1&per_page=10`,
          null,
          { token }
        );
        setNotes(result.notes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [children, token]);

  const columns = [
    {
      title: "Module Name",
      dataIndex: "module_name",
      key: "module_name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (comment) => comment || "N/A",
    },
    {
      title: "Note",
      dataIndex: "value",
      key: "value",
      render: (value) => (value != null ? value.toFixed(1) : "N/A"),
    },
    {
      title: "Teacher Name",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
  ];

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  if (loading && notes.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!children?.id) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <h1 className="text-2xl font-bold text-black">No child found.</h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-4 text-black text-center">
          See Notes
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <div className="w-full sm:w-1/3 text-start">
            <p className="text-lg font-bold text-black">
            Student Name : {` ${children.first_name} ${children.last_name}`}
            </p>
          </div>
          <Select
            placeholder="Select a type"
            onChange={handleTypeChange}
            className="w-full sm:w-1/3"
            defaultValue="EXAM1"
          >
            <Option value="EXAM1">Exam 1</Option>
            <Option value="CC">CC</Option>
            <Option value="EXAM2">Exam 2</Option>
          </Select>
        </div>
      </Card>
      <Card className="shadow-lg rounded-lg">
        <Table
          dataSource={notes
            .filter((note) => note.type === selectedType)
            .map((note) => ({
              key: note.id,
              module_name: note.module_name,
              type: note.type,
              comment: note.comment,
              value: note.value,
              teacher_name: note.teacher_name,
            }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
          className="bg-white shadow-md rounded-lg"
        />
      </Card>
    </div>
  );
};

export default SeeNote;