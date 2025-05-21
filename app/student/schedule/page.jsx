"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import apiCall from "../../../components/utils/apiCall";
import { Calendar, Card, Select, Spin, Alert, message, Tag } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function Schedule() {
  const userId = useSelector((state) => state.auth.userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);

        // Fetch student's group
        const studentResponse = await apiCall("get", `/api/students/${userId}`);
        const studentGroup = studentResponse.group_id;
        setSelectedGroup(studentGroup);

        // Fetch all groups for the student's level
        const groupsResponse = await apiCall(
          "get",
          `/api/levels/${studentResponse.level_id}/groups`
        );
        setGroups(groupsResponse);

        // Fetch schedule for the student's group
        const scheduleResponse = await apiCall(
          "get",
          `/api/groups/${studentGroup}/schedule`
        );
        setSchedule(scheduleResponse);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        message.error("Failed to load schedule");
        setLoading(false);
      }
    };

    if (userId) {
      fetchScheduleData();
    }
  }, [userId]);
  const handleGroupChange = async (groupId) => {
    try {
      setLoading(true);
      setSelectedGroup(groupId);
      const response = await apiCall("get", `/api/groups/${groupId}/schedule`);
      setSchedule(response);
      setLoading(false);
    } catch (err) {
      message.error("Failed to load schedule for selected group");
      setLoading(false);
    }
  };

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

  const dateCellRender = (date) => {
    const daySchedule = schedule.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.toDateString() === date.toDateString();
    });

    return (
      <ul className="events">
        {daySchedule.map((lesson, index) => (
          <li key={index}>
            <Card size="small" className="mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{lesson.subject}</h4>
                  <p className="text-sm text-gray-600">
                    <ClockCircleOutlined className="mr-1" />
                    {new Date(lesson.start_time).toLocaleTimeString()} -{" "}
                    {new Date(lesson.end_time).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <EnvironmentOutlined className="mr-1" />
                    {lesson.room}
                  </p>
                  <p className="text-sm">
                    <UserOutlined className="mr-1" />
                    {lesson.teacher_name}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Tag color="blue">{lesson.module}</Tag>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <Select
          value={selectedGroup}
          onChange={handleGroupChange}
          style={{ width: 200 }}
          options={groups.map((group) => ({
            value: group.id,
            label: group.name,
          }))}
        />
      </div>

      <Card>
        <Calendar dateCellRender={dateCellRender} mode="month" />
      </Card>
    </div>
  );
}
