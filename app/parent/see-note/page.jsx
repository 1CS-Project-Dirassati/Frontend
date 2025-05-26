"use client";
import React, { useEffect, useState } from "react";
import { Table, Select, Card, Spin } from "antd";
import apiCall from "../../../components/utils/apiCall"; // Adjust the import path as necessary
import { useSelector} from "react-redux";


const { Option } = Select;

const SeeNote = () => {
  const token = useSelector((state) => state.auth.accessToken);
  const parentID = useSelector((state) => state.userinfo.userProfile.id);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedType, setSelectedType] = useState("EXAM1"); // Set default type to EXAM1
  const [loading, setLoading] = useState(true); // Add loading state
  const [notes, setNotes] = useState([]); // State to hold notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiCall(
          "get",
          `/api/students/?parent_id=${parentID}&page=1&per_page=10`,
          null,
          { token }
        );
        setChildren(result.students);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Ensure loading is false even if there's an error
      }
    };

    fetchData();
  }, [parentID, token]);
 useEffect(() => {
   const fetchData = async () => {
      try {
        const result = await apiCall(
          "get",
          `/api/notes/?student_id=${children[0]?.id}&page=1&per_page=10`,
          null,
          { token }
        );
          setNotes(
            result.notes
              .filter((note) => note.type === "EXAM1")
              .map((note) => ({
                key: note.id,
                moduleName: note.module_name,
                type: note.type,
                comment: note.comment || "N/A",
                note: note.value || "N/A",
                teacherName: note.teacher_name,
                studentId: note.student_id,
              }))
          );
    
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Ensure loading is false even if there's an error
      }


    };
    fetchData()
    }, [children]);

  




   const fetchData = async (studentid) => {
      try {
        const result = await apiCall(
          "get",
          `/api/notes/?student_id=${studentid}&page=1&per_page=10`,
          null,
          { token }
        );
        setNotes(
          result.notes.map((note) => ({
            key: note.id,
            moduleName: note.module_name,
            type: note.type,
            comment: note.comment || "N/A",
            note: note.value || "N/A",
            teacherName: note.teacher_name,
            studentId: note.student_id, // Ensure student_id is included
          }))
        ); 
        console.log(result.notes)// Replace the notes state with new notes
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Ensure loading is false even if there's an error
      }


    };
  
 
 

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

  const handleChildChange = (value) => {
    setSelectedChild(value);
    fetchData(value); // Fetch notes for the selected child
  };

  if (loading && notes.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <h1 className="text-2xl font-bold text-black">No children found.</h1>
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
          <Select
            placeholder="Select a child"
            onChange={handleChildChange} // Use the new handler
            className="w-full sm:w-1/3"
            defaultValue={children[0]?.id}
          >
            {children.map((child) => (
              <Option key={child.id} value={child.id}>
                {`${child.first_name} ${child.last_name}`}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select a type"
            onChange={(value) => setSelectedType(value)}
            className="w-full sm:w-1/3"
            defaultValue="EXAM1" // Set default value to EXAM1
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
            .filter((note) => note.type === selectedType) // Ensure filtering by selectedType
            .map((note) => ({
              key: note.key,
              moduleName: note.moduleName,
              type: note.type,
              comment: note.comment || "N/A",
              note: note.note || "N/A",
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
