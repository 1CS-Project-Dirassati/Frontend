"use client";

import React, { useState, useEffect } from "react";
import { Card, Select, Table, InputNumber, Button, message } from "antd";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import apiCall from "@/components/utils/apiCall";

const fetchStudentsForGroup = async (groupId, token) => {
  console.log("Fetching students for group:", groupId);
  const res = await apiCall("get", `/api/groups/${groupId}/students/`, null, {
    token,
  });

  console.log("Students API response:", res);

  return res.students || res.data || [];
};

// ========== Component ==========

export default function TeacherMarksPage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState({ test: false, cc: false, exam: false });
  const teacherId = useSelector((state)=>state.userinfo.userProfile.id) 



  useEffect(() => {
    if (!selectedGroup || !token) return;

    setLoadingStudents(true);
    fetchStudentsForGroup(selectedGroup, token)
      .then((data) => {
        setStudents(
          data.map((s) => ({
            ...s,
            test: null,
            cc: null,
            exam: null,
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        message.error("Failed to load students.");
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedGroup, token]);

  useEffect(() => {
    setSelectedGroup(null);
    setStudents([]);
  }, [selectedModule]);

  const handleMarkChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async (field) => {
    if (!selectedModule) return;

    setSaving((prev) => ({ ...prev, [field]: true }));
    try {
      const payload = students
        .filter((s) => s[field] !== null && s[field] !== undefined)
        .map((s) => ({
          student_id: s.id,
          module_id: selectedModule,
          value: s[field],
          type: field,
          comment: "",
        }));

      await apiCall("post", "/api/notes/", payload, { token });

      message.success(`${field.toUpperCase()} marks saved.`);
    } catch {
      message.error(`Failed to save ${field} marks.`);
    } finally {
      setSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleExportCSV = () => {
    if (!students.length) {
      message.warn("No data to export.");
      return;
    }
    const header = ["Student ID", "Name", "Test", "CC", "Exam"];
    const rows = students.map((s) => [
      s.id,
      `${s.first_name || ""} ${s.last_name || s.name || ""}`,
      s.test ?? "",
      s.cc ?? "",
      s.exam ?? "",
    ]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marks_${selectedModule || "group"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { title: "Student ID", dataIndex: "id", key: "id" },
    {
      title: "Name",
      key: "name",
      render: (_, s) => `${s.first_name || ""} ${s.last_name || s.name || ""}`,
    },
    {
      title: (
        <span>
          Test&nbsp;
          <Button
            size="small"
            onClick={() => handleSave("test")}
            loading={saving.test}
          >
            Save
          </Button>
        </span>
      ),
      dataIndex: "test",
      key: "test",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={100}
          value={r.test}
          onChange={(v) => handleMarkChange(r.id, "test", v)}
        />
      ),
    },
    {
      title: (
        <span>
          CC&nbsp;
          <Button
            size="small"
            onClick={() => handleSave("cc")}
            loading={saving.cc}
          >
            Save
          </Button>
        </span>
      ),
      dataIndex: "cc",
      key: "cc",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={100}
          value={r.cc}
          onChange={(v) => handleMarkChange(r.id, "cc", v)}
        />
      ),
    },
    {
      title: (
        <span>
          Exam&nbsp;
          <Button
            size="small"
            onClick={() => handleSave("exam")}
            loading={saving.exam}
          >
            Save
          </Button>
        </span>
      ),
      dataIndex: "exam",
      key: "exam",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={100}
          value={r.exam}
          onChange={(v) => handleMarkChange(r.id, "exam", v)}
        />
      ),
    },
  ];

  // Add static data for visualization
  useEffect(() => {
    // Static modules
    setModules([
      { id: "m1", name: "Mathematics", groups: [{ id: "g1", name: "Group A" }] },
      { id: "m2", name: "Physics", groups: [{ id: "g2", name: "Group B" }] },
    ]);

    // Static groups
    setGroups([
      { id: "g1", name: "Group A" },
      { id: "g2", name: "Group B" },
    ]);

    // Static students
    setStudents([
      { id: "s1", first_name: "John", last_name: "Doe", test: 85, cc: 90, exam: 88 },
      { id: "s2", first_name: "Jane", last_name: "Smith", test: 78, cc: 82, exam: 80 },
      { id: "s3", first_name: "Alice", last_name: "Johnson", test: 92, cc: 95, exam: 94 },
    ]);
  }, []);

  return (
    <Card title="Enter Student Marks">
      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
        <Select
          placeholder="Select Module"
          style={{ width: 240 }}
          options={modules.map((m) => ({ label: m.name, value: m.id }))}
          value={selectedModule}
          onChange={(val) => setSelectedModule(val)}
        />
        <Select
          placeholder="Select Group"
          style={{ width: 240 }}
          options={
            selectedModule
              ? groups
                  .filter((g) =>
                    modules
                      .find((m) => m.id === selectedModule)
                      ?.groups?.some((mg) => mg.id === g.id)
                  )
                  .map((g) => ({ label: g.name, value: g.id }))
              : []
          }
          value={selectedGroup}
          onChange={(val) => setSelectedGroup(val)}
          disabled={!selectedModule}
        />
        <Button onClick={handleExportCSV} disabled={!students.length}>
          Export CSV
        </Button>
      </div>
      <Table
        dataSource={students}
        columns={columns}
        rowKey="id"
        loading={loadingStudents}
        pagination={false}
        bordered
      />
    </Card>
  );
}
