"use client";

import React, { useState, useEffect } from "react";
import { Card, Select, Table, InputNumber, Button, message } from "antd";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import apiCall from "@/components/utils/apiCall";

// ===== FETCHERS OUTSIDE COMPONENT =====

// ========== COMPONENT ==========

export default function TeacherMarksPage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState({ test: false, cc: false, exam: false });

  const teacherId = token ? jwtDecode(token)?.teacher_id : null;

  const fetchModulesAndGroups = async (teacherId, token) => {
    const res = await apiCall(
      "get",
      `/api/modules/?teacher_id=${teacherId}`,
      null,
      { token }
    );
    const fetchedModules = res.modules || res.data || [];

    const allGroups = fetchedModules
      .flatMap((m) => m.groups || [])
      .filter((g, i, self) => self.findIndex((x) => x.id === g.id) === i);

    return { modules: fetchedModules, groups: allGroups };
  };

  const fetchStudentsForGroup = async (groupId, token) => {
    const res = await apiCall("get", `/api/groups/${groupId}/students/`, null, {
      token,
    });
    return res.students || res.data || [];
  };

  useEffect(() => {
    if (!token || !teacherId) return;

    fetchModulesAndGroups(teacherId, token)
      .then(({ modules, groups }) => {
        setModules(modules);
        setGroups(groups);
      })
      .catch(() => message.error("Failed to load modules."));
  }, [token, teacherId]);

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }

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
      .catch(() => message.error("Failed to load students."))
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
