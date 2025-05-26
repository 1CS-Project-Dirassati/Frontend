"use client";

import React, { useState, useEffect } from "react";
import { Card, Select, Table, InputNumber, Button, message } from "antd";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import apiCall from "@/components/utils/apiCall";

// ========== Fetchers ==========

const fetchModulesAndGroups = async (token) => {
  console.log("Fetching modules with token:", token);
  try {
    const res = await apiCall("get", "/api/modules/", null, { token });
    console.log("Modules API response:", res);
    const fetchedModules = res.data?.modules || res.modules || res.data || [];
    const allGroups = fetchedModules
      .flatMap((m) => m.groups || [])
      .filter((g, i, self) => self.findIndex((x) => x.id === g.id) === i);
    console.log("Fetched modules:", fetchedModules);
    console.log("Fetched groups:", allGroups);
    return { modules: fetchedModules, groups: allGroups };
  } catch (err) {
    console.error("Error fetching modules:", err.message, err.stack);
    throw err;
  }
};

const fetchStudentsForGroup = async (groupId, token) => {
  console.log("Fetching students for group:", groupId);
  try {
    const res = await apiCall("get", `/api/groups/${groupId}/students/`, null, {
      token,
    });
    console.log("Students API response:", res);
    const students = res.data?.students || res.students || res.data || [];
    console.log("Fetched students:", students);
    return students;
  } catch (err) {
    console.error("Error fetching students:", err.message, err.stack);
    throw err;
  }
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

  // Log token for debugging
  console.log("Current token:", token);

  useEffect(() => {
    if (!token) {
      console.warn("No token — skipping module fetch.");
      message.error("Please log in to continue.");
      return;
    }

    fetchModulesAndGroups(token)
      .then(({ modules, groups }) => {
        setModules(modules);
        setGroups(groups);
        console.log("Modules set:", modules);
        console.log("Groups set:", groups);
        // Auto-select first module if available
        if (modules.length > 0) {
          setSelectedModule(modules[0].id);
        }
      })
      .catch((err) => {
        console.error("Error fetching modules:", err);
        message.error("Failed to load modules.");
      });
  }, [token]);

  useEffect(() => {
    if (!selectedGroup || !token) {
      console.log("Skipping student fetch: No group or token", {
        selectedGroup,
        token,
      });
      return;
    }

    setLoadingStudents(true);
    fetchStudentsForGroup(selectedGroup, token)
      .then((data) => {
        const studentsWithMarks = data.map((s) => ({
          ...s,
          test: null,
          cc: null,
          exam: null,
        }));
        setStudents(studentsWithMarks);
        console.log("Students set:", studentsWithMarks);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        message.error("Failed to load students.");
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  }, [selectedGroup, token]);

  useEffect(() => {
    console.log(
      "Resetting group and students due to module change:",
      selectedModule
    );
    setSelectedGroup(null);
    setStudents([]);
  }, [selectedModule]);

  const handleMarkChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async (field) => {
    if (!selectedModule) {
      message.error("Please select a module.");
      return;
    }

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
    } catch (err) {
      console.error(`Error saving ${field} marks:`, err);
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
          Test
          <Button
            size="small"
            onClick={() => handleSave("test")}
            loading={saving.test}
            style={{ marginLeft: 8 }}
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
          CC
          <Button
            size="small"
            onClick={() => handleSave("cc")}
            loading={saving.cc}
            style={{ marginLeft: 8 }}
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
          Exam
          <Button
            size="small"
            onClick={() => handleSave("exam")}
            loading={saving.exam}
            style={{ marginLeft: 8 }}
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
