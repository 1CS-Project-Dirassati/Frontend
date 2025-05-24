"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Select } from "antd";
import { Table as AntTable } from "antd";
const { Option } = Select;

export default function Schedule() {
  const router = useRouter();
  const [trimester, setTrimester] = useState("Trimester 1");
  const [week, setWeek] = useState(1);
  const trimesters = ["Trimester 1", "Trimester 2", "Trimester 3"];
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  // Static timetable per trimester/week
  const sessions = [
    {
      id: "s1",
      day: "Monday",
      time: "08:00",
      subject: "Math",
      teacher: "Dr. A",
      room: "R1",
      groupId: "g1",
      trimester: "Trimester 1",
      week: 1,
    },
    {
      id: "s2",
      day: "Tuesday",
      time: "10:00",
      subject: "Physics",
      teacher: "Dr. B",
      room: "R2",
      groupId: "g2",
      trimester: "Trimester 1",
      week: 1,
    },
    // ... other static sessions ...
  ].filter((s) => s.trimester === trimester && s.week === week);

  // Derive days and time slots for matrix from sessions
  const days = Array.from(new Set(sessions.map((s) => s.day)));
  const timeSlots = Array.from(new Set(sessions.map((s) => s.time))).sort();

  // build Ant Design columns and data source for a matrix layout
  const columns = [
    { title: "Time", dataIndex: "time", key: "time" },
    ...days.map((day) => ({ title: day, dataIndex: day, key: day })),
  ];
  const dataSource = timeSlots.map((slot) => {
    const row = { key: slot, time: slot };
    days.forEach((day) => {
      const session = sessions.find((s) => s.day === day && s.time === slot);
      row[day] = session ? (
        <div
          className="cursor-pointer hover:underline"
          onClick={() =>
            router.push(
              `/teacher/attendance?sessionId=${session.id}&groupId=${session.groupId}`
            )
          }
        >
          <strong>{session.subject}</strong>
          <br />
          <span>{session.teacher}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      );
    });
    return row;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <div className="flex gap-2">
          <Select
            value={trimester}
            onChange={setTrimester}
            style={{ width: 200 }}
          >
            {trimesters.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          <Select value={week} onChange={setWeek} style={{ width: 120 }}>
            {weeks.map((w) => (
              <Option key={w} value={w}>{`Week ${w}`}</Option>
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
          />
        </div>
      </Card>
    </div>
  );
}
// end of file
