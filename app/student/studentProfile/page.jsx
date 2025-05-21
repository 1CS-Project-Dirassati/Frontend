"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import apiCall from "../../../components/utils/apiCall";
import { Card, Avatar, Tabs, List, Tag, Spin, Alert, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export default function StudentProfile() {
  const userId = useSelector((state) => state.auth.userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const response = await apiCall("get", `/api/students/${userId}`);
        setStudentData(response);

        // Fetch student notes
        const notesResponse = await apiCall(
          "get",
          `/api/students/${userId}/notes`
        );
        setNotes(notesResponse);

        // Fetch student absences
        const absencesResponse = await apiCall(
          "get",
          `/api/students/${userId}/absences`
        );
        setAbsences(absencesResponse);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        message.error("Failed to load student profile");
        setLoading(false);
      }
    };

    if (userId) {
      fetchStudentProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const items = [
    {
      key: "1",
      label: "Personal Information",
      children: (
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <h2 className="text-2xl font-bold">
                {studentData?.first_name} {studentData?.last_name}
              </h2>
              <p className="text-gray-600">
                <MailOutlined className="mr-2" />
                {studentData?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Academic Information
              </h3>
              <p>
                <BookOutlined className="mr-2" />
                Level: {studentData?.level?.name}
              </p>
              <p>
                <TeamOutlined className="mr-2" />
                Group: {studentData?.group?.name}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Parent Information</h3>
              <p>
                Parent Name: {studentData?.parent?.first_name}{" "}
                {studentData?.parent?.last_name}
              </p>
              <p>Parent Email: {studentData?.parent?.email}</p>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: "2",
      label: "Academic Performance",
      children: (
        <Card>
          <List
            dataSource={notes}
            renderItem={(note) => (
              <List.Item>
                <List.Item.Meta
                  title={`${note.subject} - ${note.module}`}
                  description={`Date: ${new Date(
                    note.date
                  ).toLocaleDateString()}`}
                />
                <div>
                  <Tag color={note.grade >= 10 ? "green" : "red"}>
                    Grade: {note.grade}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: "3",
      label: "Attendance Record",
      children: (
        <Card>
          <List
            dataSource={absences}
            renderItem={(absence) => (
              <List.Item>
                <List.Item.Meta
                  title={`${absence.subject} - ${absence.module}`}
                  description={`Date: ${new Date(
                    absence.date
                  ).toLocaleDateString()}`}
                />
                <div>
                  <Tag color={absence.justified ? "blue" : "red"}>
                    {absence.justified ? "Justified" : "Unjustified"}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}
