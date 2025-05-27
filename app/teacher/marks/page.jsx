"use client";

import { useState, useEffect } from "react";
import { Card, Select, Table, Button, Input, message, Spin } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

const { Option } = Select;

export default function TeacherMarks() {
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState({});
  const [previousNotes, setPreviousNotes] = useState({});
  
  const token = useSelector((state) => state.auth.accessToken);
  const teacherId = useSelector((state) => state.userinfo.userProfile.id);

  // Fetch modules for the current teacher
  useEffect(() => {
    const fetchModules = async () => {
      if (!token || !teacherId) return;

      try {
        setLoading(true);
        const response = await apiCall(
          "GET",
          `/api/modules/?teacher_id=${teacherId}`,
          null,
          { token }
        );
        console.log("modules");
        console.log(response);

        if (response.status && response.modules) {
          setModules(response.modules);
        } else {
          message.error("Failed to fetch modules");
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        message.error("Error loading modules");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [token, teacherId]);

  // Fetch groups when module is selected
  useEffect(() => {
    const fetchGroups = async () => {
      if (!token || !teacherId || !selectedModule) return;

      try {
        setLoading(true);
        const response = await apiCall(
          "GET",
          `/api/groups/?module_id=${selectedModule.id}&teacher_id=${teacherId}`,
          null,
          { token }
        );
        console.log("groups");
        console.log(response);

        if (response.status && response.groups) {
          setGroups(response.groups);
        } else {
          message.error("Failed to fetch groups");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        message.error("Error loading groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token, teacherId, selectedModule]);

  // Fetch students and their previous notes when group is selected
  useEffect(() => {
    const fetchStudentsAndNotes = async () => {
      if (!token || !selectedGroup || !selectedModule) return;

      try {
        setLoading(true);
        // Fetch students
        const studentsResponse = await apiCall(
          "GET",
          `/api/students/?group_id=${selectedGroup.id}`,
          null,
          { token }
        );

        console.log("students response:", studentsResponse);

        if (!studentsResponse.status || !studentsResponse.students) {
          throw new Error("Failed to fetch students");
        }

        // Process students and initialize marks
        const students = studentsResponse.students;
        console.log("processed students:", students);
        setStudents(students);

        // Fetch previous notes for this module and group
        const notesResponse = await apiCall(
          "GET",
          `/api/notes/?module_id=${selectedModule.id}&group_id=${selectedGroup.id}`,
          null,
          { token }
        );

        console.log("notes response:", notesResponse);

        if (!notesResponse.status) {
          throw new Error("Failed to fetch previous notes");
        }

        // Initialize marks and previous notes
        const initialMarks = {};
        const notesByStudent = {};

        students.forEach(student => {
          // Initialize marks object
          initialMarks[student.id] = {
            cc: "",
            exam1: "",
            exam2: ""
          };

          // Initialize notes object
          notesByStudent[student.id] = {
            cc: null,
            exam1: null,
            exam2: null
          };
        });

        // Process previous notes
        if (notesResponse.notes && Array.isArray(notesResponse.notes)) {
          notesResponse.notes.forEach(note => {
            if (notesByStudent[note.student_id]) {
              // Convert note type to lowercase for consistency
              const noteType = note.type.toLowerCase();
              notesByStudent[note.student_id][noteType] = note;
              // Set the mark value in the marks state
              initialMarks[note.student_id][noteType] = note.value.toString();
            }
          });
        }

        console.log("setting marks:", initialMarks);
        console.log("setting previous notes:", notesByStudent);

        setPreviousNotes(notesByStudent);
        setMarks(initialMarks);

      } catch (error) {
        console.error("Error fetching data:", error);
        message.error(error.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndNotes();
  }, [token, selectedGroup, selectedModule]);

  const handleModuleChange = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    setSelectedModule(module);
    setSelectedGroup(null);
    setStudents([]);
    setMarks({});
  };

  const handleGroupChange = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group);
    setStudents([]);
    setMarks({});
  };

  const handleMarkChange = (studentId, type, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: value
      }
    }));
  };

  const saveMarks = async (type) => {
    if (!selectedModule || !selectedGroup) {
      message.error("Please select both module and group");
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [type]: true }));

      // Get all students with marks for the selected type
      const studentsWithMarks = students.filter(student => {
        const mark = marks[student.id]?.[type];
        return mark !== undefined && mark !== "";
      });

      if (studentsWithMarks.length === 0) {
        message.warning(`No marks to save for ${type}`);
        return;
      }

      // Process each student's mark
      for (const student of studentsWithMarks) {
        const markValue = parseFloat(marks[student.id][type]);
        const existingNote = previousNotes[student.id]?.[type.toLowerCase()];
        
        const noteData = {
          student_id: student.id,
          module_id: selectedModule.id,
          teacher_id: teacherId,
          value: markValue,
          type: type.toLowerCase(),
          comment: existingNote?.comment || ""
        };

        let response;
        if (existingNote) {
          // Update existing note with PATCH
          response = await apiCall(
            "PATCH",
            `/api/notes/${existingNote.id}`,
            noteData,
            { token }
          );
        } else {
          // Create new note with POST
          response = await apiCall(
            "POST",
            "/api/notes/",
            noteData,
            { token }
          );
        }

        if (!response.status) {
          throw new Error(
            response.message || 
            `Failed to ${existingNote ? 'update' : 'save'} ${type} mark for student ${student.id}`
          );
        }

        // Update the previous notes state with the new/updated note
        setPreviousNotes(prev => ({
          ...prev,
          [student.id]: {
            ...prev[student.id],
            [type.toLowerCase()]: response.note
          }
        }));
      }

      message.success(`${type.toUpperCase()} marks ${existingNote ? 'updated' : 'saved'} successfully`);
    } catch (error) {
      console.error(`Error saving ${type} marks:`, error);
      message.error(error.message || `Error saving ${type} marks`);
    } finally {
      setSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>CC</span>
          <Button
            type="primary"
            size="small"
            loading={saving.cc}
            onClick={() => saveMarks("cc")}
          >
            Save
          </Button>
        </div>
      ),
      dataIndex: "cc",
      key: "cc",
      render: (_, record) => {
        const previousNote = previousNotes[record.id]?.cc;
        return (
          <div className="flex flex-col gap-1">
            <Input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={marks[record.id]?.cc}
              onChange={(e) => handleMarkChange(record.id, "cc", e.target.value)}
              placeholder="Enter CC mark"
            />
            {previousNote && (
              <div className="text-xs text-gray-500">
                Previous: {previousNote.value} 
                {previousNote.comment && ` (${previousNote.comment})`}
                <br />
                <span className="text-gray-400">
                  {new Date(previousNote.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>Exam 1</span>
          <Button
            type="primary"
            size="small"
            loading={saving.exam1}
            onClick={() => saveMarks("exam1")}
          >
            Save
          </Button>
        </div>
      ),
      dataIndex: "exam1",
      key: "exam1",
      render: (_, record) => {
        const previousNote = previousNotes[record.id]?.exam1;
        return (
          <div className="flex flex-col gap-1">
            <Input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={marks[record.id]?.exam1}
              onChange={(e) => handleMarkChange(record.id, "exam1", e.target.value)}
              placeholder="Enter Exam 1 mark"
            />
            {previousNote && (
              <div className="text-xs text-gray-500">
                Previous: {previousNote.value}
                {previousNote.comment && ` (${previousNote.comment})`}
                <br />
                <span className="text-gray-400">
                  {new Date(previousNote.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span>Exam 2</span>
          <Button
            type="primary"
            size="small"
            loading={saving.exam2}
            onClick={() => saveMarks("exam2")}
          >
            Save
          </Button>
        </div>
      ),
      dataIndex: "exam2",
      key: "exam2",
      render: (_, record) => {
        const previousNote = previousNotes[record.id]?.exam2;
        return (
          <div className="flex flex-col gap-1">
            <Input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={marks[record.id]?.exam2}
              onChange={(e) => handleMarkChange(record.id, "exam2", e.target.value)}
              placeholder="Enter Exam 2 mark"
            />
            {previousNote && (
              <div className="text-xs text-gray-500">
                Previous: {previousNote.value}
                {previousNote.comment && ` (${previousNote.comment})`}
                <br />
                <span className="text-gray-400">
                  {new Date(previousNote.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Card title="Manage Marks" className="mb-6">
        <div className="flex gap-4 mb-6">
          <Select
            style={{ width: 200 }}
            placeholder="Select Module"
            value={selectedModule?.id}
            onChange={handleModuleChange}
            loading={loading}
          >
            {modules.map((module) => (
              <Option key={module.id} value={module.id}>
                {module.name}
              </Option>
            ))}
          </Select>

          <Select
            style={{ width: 200 }}
            placeholder="Select Group"
            value={selectedGroup?.id}
            onChange={handleGroupChange}
            loading={loading}
            disabled={!selectedModule}
          >
            {groups.map((group) => (
              <Option key={group.id} value={group.id}>
                {group.name}
              </Option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spin size="large" />
          </div>
        ) : selectedGroup && students && students.length > 0 ? (
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={false}
          />
        ) : selectedGroup ? (
          <div className="text-center text-gray-500 p-4">
            No students found in this group
          </div>
        ) : null}
      </Card>
    </div>
  );
}
