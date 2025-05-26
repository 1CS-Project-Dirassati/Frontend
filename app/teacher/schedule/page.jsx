"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Select, Spin, message } from "antd";
import { Table as AntTable } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

const { Option } = Select;

// Helper function to parse time slot (e.g., "d1h8-10" to day and time)
const parseTimeSlot = (timeSlot) => {
  const [dayPart, timePart] = timeSlot.split('h');
  const day = parseInt(dayPart.replace('d', ''));
  const [start, end] = timePart.split('-').map(t => `${t}:00`);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return {
    day: days[day - 1],
    time: start,
    endTime: end
  };
};

export default function Schedule() {
  const router = useRouter();
  const [semesterIndex, setSemesterIndex] = useState(1);
  const [week, setWeek] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const authToken = useSelector((state) => state.auth.accessToken);
  const permision = useSelector((state) => state.auth.accessToken);

  // Redirect if not authenticated
  if (!permision) {
    router.push("/signin/teacher");
    return null;
  }

  const semesters = [
    { value: 1, label: "Trimester 1" },
    { value: 2, label: "Trimester 2" },
    { value: 3, label: "Trimester 3" }
  ];
  
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiCall(
          'GET',
          `api/sessions/?semester_index=${semesterIndex}&week=${week}`,
          null,
          { token: authToken }
        );

        if (response.status && response.sessions) {
          // Transform the sessions data for display
          const formattedSessions = response.sessions.map(session => {
            const { day, time, endTime } = parseTimeSlot(session.time_slot);
            return {
              id: session.id,
              day,
              time,
              endTime,
              subject: session.module_name,
              teacher: session.teacher_name,
              room: session.salle_name,
              groupId: session.group_id,
              groupName: session.group_name
            };
          });
          setSessions(formattedSessions);
        } else {
          setError("Failed to fetch sessions");
          message.error("Failed to fetch sessions");
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setError(error.message);
        message.error("Error loading schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [semesterIndex, week, authToken]);

  // Get unique days and time slots from sessions
  const days = Array.from(new Set(sessions.map(s => s.day))).sort();
  const timeSlots = Array.from(new Set(sessions.map(s => s.time))).sort();

  // Build table columns
  const columns = [
    { 
      title: "Time", 
      dataIndex: "time", 
      key: "time",
      render: (time, record) => `${time} - ${record.endTime}`
    },
    ...days.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
    }))
  ];

  // Build table data
  const dataSource = timeSlots.map(slot => {
    const row = { 
      key: slot, 
      time: slot,
      endTime: sessions.find(s => s.time === slot)?.endTime || ''
    };
    
    days.forEach(day => {
      const session = sessions.find(s => s.day === day && s.time === slot);
      row[day] = session ? (
        <div
          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => router.push(
            `/teacher/attendance?sessionId=${session.id}&groupId=${session.groupId}`
          )}
        >
          <div className="font-semibold text-primary">{session.subject}</div>
          <div className="text-sm text-gray-600">Group: {session.groupName}</div>
          <div className="text-sm text-gray-500">Room: {session.room}</div>
        </div>
      ) : (
        <span className="text-gray-300">-</span>
      );
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
        <Card className="text-center">
          <h2 className="text-red-500">Error loading schedule</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <div className="flex gap-2">
          <Select
            value={semesterIndex}
            onChange={setSemesterIndex}
            style={{ width: 200 }}
          >
            {semesters.map(sem => (
              <Option key={sem.value} value={sem.value}>
                {sem.label}
              </Option>
            ))}
          </Select>
          <Select 
            value={week} 
            onChange={setWeek} 
            style={{ width: 120 }}
          >
            {weeks.map(w => (
              <Option key={w} value={w}>
                Week {w}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <div className="overflow-auto">
          <AntTable
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            size="middle"
          />
        </div>
      </Card>
    </div>
  );
}
// end of file
