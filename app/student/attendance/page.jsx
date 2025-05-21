"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, Table, Tag, Spin, Alert, message, Progress } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export default function Attendance() {
  const userId = useSelector((state) => state.auth.userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        // Fetch attendance statistics
        const attendanceResponse = await axios.get(
          `/api/students/${userId}/attendance`
        );
        setAttendanceData(attendanceResponse.data);

        // Fetch detailed absences
        const absencesResponse = await axios.get(
          `/api/students/${userId}/absences`
        );
        setAbsences(absencesResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        message.error("Failed to load attendance data");
        setLoading(false);
      }
    };

    if (userId) {
      fetchAttendanceData();
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

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          present: {
            color: "green",
            icon: <CheckCircleOutlined />,
            text: "Present",
          },
          late: {
            color: "orange",
            icon: <ClockCircleOutlined />,
            text: "Late",
          },
          absent: {
            color: "red",
            icon: <CloseCircleOutlined />,
            text: "Absent",
          },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Justification",
      dataIndex: "justification",
      key: "justification",
      render: (justification) => justification || "N/A",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Record</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Overall Attendance Rate
            </h3>
            <Progress
              type="circle"
              percent={attendanceData?.attendanceRate || 0}
              format={(percent) => `${percent}%`}
              status={
                attendanceData?.attendanceRate >= 80 ? "success" : "exception"
              }
            />
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Total Absences</h3>
            <div className="text-3xl font-bold text-red-500">
              {attendanceData?.totalAbsences || 0}
            </div>
            <p className="text-gray-600">This semester</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Late Arrivals</h3>
            <div className="text-3xl font-bold text-orange-500">
              {attendanceData?.totalLates || 0}
            </div>
            <p className="text-gray-600">This semester</p>
          </div>
        </Card>
      </div>

      <Card title="Detailed Attendance Record" className="mb-6">
        <Table
          columns={columns}
          dataSource={absences}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card title="Attendance Policy" className="mb-6">
        <div className="space-y-4">
          <p>
            <strong>Attendance Requirements:</strong> Students are required to
            maintain an attendance rate of at least 80%.
          </p>
          <p>
            <strong>Late Arrivals:</strong> Students arriving more than 15
            minutes late will be marked as late.
          </p>
          <p>
            <strong>Absence Justification:</strong> Absences must be justified
            with appropriate documentation within 48 hours.
          </p>
          <p>
            <strong>Consequences:</strong> Students with attendance rates below
            80% may face academic penalties.
          </p>
        </div>
      </Card>
    </div>
  );
}
