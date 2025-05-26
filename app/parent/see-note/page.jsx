"use client";
import React, { useEffect, useState } from "react";
import { Table, Select, Card } from "antd";
import apiCall from "../../../components/utils/apiCall"; // Adjust the import path as necessary
import { useSelector} from "react-redux";


const { Option } = Select;

const SeeNote = () => {
  const token = useSelector((state ) => state.auth.accessToken);
  const parentID = useSelector((state)=>state.userinfo.userProfile.id) 
  const [children,setChildren]=useState([]);
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedType, setSelectedType] = useState("Exam 1");
useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await apiCall(
        "get",
        `/api/students/?parent_id=${parentID}&page=1&per_page=10`,
        null,
        {token}
      );
      setChildren(result.students)
      console.log(result); // Handle the result as needed
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

  

  const notes = [
    {
      key: "1",
      moduleName: "Mathematics",
      type: "Exam 1",
      exam1: { comment: "Needs improvement", note: "B+" },
      cc: { comment: "Good effort", note: "B" },
      exam2: { comment: "Excellent", note: "A" },
      teacherName: "Mr. Smith",
    },
    {
      key: "2",
      moduleName: "Science",
      type: "Exam 1",
      exam1: { comment: "Outstanding", note: "A+" },
      cc: { comment: "Well done", note: "A" },
      exam2: { comment: "Good", note: "B+" },
      teacherName: "Ms. Johnson",
    },
    {
      key: "3",
      moduleName: "History",
      type: "Exam 1",
      exam1: { comment: "Needs improvement", note: "C" },
      cc: { comment: "Satisfactory", note: "B-" },
      exam2: { comment: "Excellent", note: "A" },
      teacherName: "Mr. Brown",
    },
  ];

  const columns = [
    {
      title: "Module Name",
      dataIndex: "moduleName",
      key: "moduleName",
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
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Teacher Name",
      dataIndex: "teacherName",
      key: "teacherName",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-4 text-black text-center">
          See Notes
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <Select
            placeholder="Select a child"
            onChange={(value) => setSelectedChild(value)}
            className="w-full sm:w-1/3"
            defaultValue={`${children.first_name} ${children.last_name}`}
          >
            {children.map((child) => (
              <Option key={child.id} value={`${child.first_name} ${child.last_name}`}>
                {child.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select a type"
            onChange={(value) => setSelectedType(value)}
            className="w-full sm:w-1/3"
            defaultValue={selectedType}
          >
            <Option value="Exam 1">Exam 1</Option>
            <Option value="CC">CC</Option>
            <Option value="Exam 2">Exam 2</Option>
          </Select>
        </div>
      </Card>
      <Card className="shadow-lg rounded-lg">
        <Table
          dataSource={notes.map((note) => ({
            key: note.key,
            moduleName: note.moduleName,
            type: selectedType,
            comment:
              note[selectedType.toLowerCase().replace(" ", "")]?.comment || "N/A",
            note:
              note[selectedType.toLowerCase().replace(" ", "")]?.note || "N/A",
            teacherName: note.teacherName,
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
