"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import { Table, Card, Tag, Spin, Alert, Typography, message } from "antd";

const { Title } = Typography;

// Day mapping (d1 = Sunday, ..., d5 = Thursday)
const dayMap = {
  d1: "Sunday",
  d2: "Monday",
  d3: "Tuesday",
  d4: "Wednesday",
  d5: "Thursday",
};

// Time slots to show in order
const timeSlots = ["h8-10", "h10-12", "h14-16"];
const dayOrder = ["d1", "d2", "d3", "d4", "d5"];

const getDayFromSlot = (slot) => slot.slice(0, 2);
const getTimeFromSlot = (slot) => slot.slice(2);

export default function ViewSchedulePage() {
  const { group_id, trimester_id } = useParams();
  const token = useSelector((state) => state.auth.accessToken);

  const [sessions, setSessions] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);

        // Fetch sessions
        const sessionRes = await apiCall(
          "get",
          `/api/sessions/?group_id=${group_id}&semester_id=${trimester_id}`,
          null,
          { token }
        );
        setSessions(sessionRes.sessions || []);

        // Fetch group name
        const groupRes = await apiCall("get", `/api/groups/${group_id}`, null, {
          token,
        });
        setGroup(groupRes.group);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule.");
        message.error("Error fetching schedule.");
      } finally {
        setLoading(false);
      }
    };

    if (group_id && trimester_id) {
      fetchSchedule();
    }
  }, [group_id, trimester_id, token]);

  const buildScheduleMatrix = () => {
    const matrix = {};

    timeSlots.forEach((slot) => {
      matrix[slot] = {};
      dayOrder.forEach((day) => {
        matrix[slot][day] = null;
      });
    });

    sessions.forEach((s) => {
      const dayKey = getDayFromSlot(s.time_slot);
      const timeKey = getTimeFromSlot(s.time_slot);
      if (matrix[timeKey] && matrix[timeKey][dayKey] === null) {
        matrix[timeKey][dayKey] = s;
      }
    });

    return matrix;
  };

  const scheduleMatrix = buildScheduleMatrix();

  const columns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (text) => (
        <strong>{text.replace("h", "").replace("-", " - ")}</strong>
      ),
    },
    ...dayOrder.map((dayKey) => ({
      title: dayMap[dayKey],
      dataIndex: dayKey,
      key: dayKey,
      render: (session) =>
        session ? (
          <Card size="small" bordered={false}>
            <div className="font-semibold">{session.module_name}</div>
            <div className="text-sm text-gray-600">{session.teacher_name}</div>
            <div className="text-xs">{session.salle_name}</div>
            <Tag color="blue" className="mt-1">
              Week {session.weeks}
            </Tag>
          </Card>
        ) : (
          <div className="text-gray-400 text-sm">—</div>
        ),
    })),
  ];

  const dataSource = timeSlots.map((slot) => {
    const row = { key: slot, time: slot };
    dayOrder.forEach((dayKey) => {
      row[dayKey] = scheduleMatrix[slot][dayKey];
    });
    return row;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2}>Weekly Schedule</Title>
      <p className="text-lg text-gray-600 mb-4">
        Group: <strong>{group?.name}</strong>
      </p>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
        className="shadow-md rounded-md"
      />
    </div>
  );
}
