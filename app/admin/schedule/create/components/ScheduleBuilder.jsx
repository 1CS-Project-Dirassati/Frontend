"use client";

import { useState, useEffect } from "react";
import { Card, Select, Spin, message, Button } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const { Option } = Select;

// Helper function to normalize time slot format
const normalizeTimeSlot = (timeSlot) => {
  const [day, time] = timeSlot.split("h");
  const [start, end] = time.split("-");
  return `${day}h${start.padStart(2, "0")}-${end.padStart(2, "0")}`;
};

// Define fixed time slots with correct format (matching API format)
const TIME_SLOTS_BY_DAY = {
  Monday: [
    { time: "8:00", endTime: "10:00", slot: "d1h8-10" },
    { time: "10:00", endTime: "12:00", slot: "d1h10-12" },
    { time: "14:00", endTime: "16:00", slot: "d1h14-16" },
  ],
  Tuesday: [
    { time: "8:00", endTime: "10:00", slot: "d2h8-10" },
    { time: "10:00", endTime: "12:00", slot: "d2h10-12" },
    { time: "14:00", endTime: "16:00", slot: "d2h14-16" },
  ],
  Wednesday: [
    { time: "8:00", endTime: "10:00", slot: "d3h8-10" },
    { time: "10:00", endTime: "12:00", slot: "d3h10-12" },
    { time: "14:00", endTime: "16:00", slot: "d3h14-16" },
  ],
  Thursday: [
    { time: "8:00", endTime: "10:00", slot: "d4h8-10" },
    { time: "10:00", endTime: "12:00", slot: "d4h10-12" },
    { time: "14:00", endTime: "16:00", slot: "d4h14-16" },
  ],
  Friday: [
    { time: "8:00", endTime: "10:00", slot: "d5h8-10" },
    { time: "10:00", endTime: "12:00", slot: "d5h10-12" },
    { time: "14:00", endTime: "16:00", slot: "d5h14-16" },
  ],
};

// Define fixed days
const FIXED_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ScheduleBuilder({ selectedGroup, selectedTrimester, onComplete }) {
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!token || !selectedGroup?.id) return;

      try {
        setLoading(true);
        const response = await apiCall(
          "GET",
          `/api/sessions/group/${selectedGroup.id}/time-slots`,
          null,
          { token }
        );

        if (response.status && response.time_slots) {
          const transformedTimeSlots = {};
          Object.entries(response.time_slots).forEach(([slot, sessions]) => {
            if (Array.isArray(sessions) && sessions.length > 0) {
              const validSessions = sessions.filter(
                (session) =>
                  session.teacher_id &&
                  session.module_id &&
                  session.teacher_name &&
                  session.module_name
              );
              if (validSessions.length > 0) {
                transformedTimeSlots[normalizeTimeSlot(slot)] = validSessions;
              }
            }
          });
          setTimeSlots(transformedTimeSlots);
        } else {
          setError("Failed to fetch time slots");
          message.error("Failed to fetch time slots");
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setError(error.message);
        message.error("Error loading time slots");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [token, selectedGroup]);

  const handleSessionSelect = (day, timeSlot, value) => {
    const [teacherId, moduleId] = value.split("-");
    const timeSlotObj = TIME_SLOTS_BY_DAY[day]?.find((slot) => slot.slot === timeSlot);
    if (!timeSlotObj) {
      console.error("Invalid time slot selected:", { day, timeSlot });
      message.error("Invalid time slot selected");
      return;
    }

    setSelectedSessions((prev) => {
      const newSessions = { ...prev };
      if (!newSessions[day]) {
        newSessions[day] = {};
      }
      newSessions[day][timeSlotObj.slot] = { teacherId, moduleId };
      return newSessions;
    });
  };

  const handleSubmit = async () => {
    if (!selectedGroup || !selectedTrimester) {
      message.error("Please select both group and trimester");
      return;
    }

    try {
      setSubmitting(true);
      const validSessions = [];
      for (const day in selectedSessions) {
        for (const timeSlot in selectedSessions[day]) {
          const { teacherId, moduleId } = selectedSessions[day][timeSlot];
          const timeSlotObj = TIME_SLOTS_BY_DAY[day].find(
            (slot) => slot.slot === timeSlot
          );
          if (!timeSlotObj) {
            console.error("Invalid time slot details:", {
              day,
              timeSlot,
              availableSlots: TIME_SLOTS_BY_DAY[day].map((s) => s.slot),
            });
            throw new Error(`Invalid time slot format for ${day}: ${timeSlot}`);
          }
          const session = {
            teacher_id: parseInt(teacherId),
            module_id: parseInt(moduleId),
            group_id: selectedGroup.id,
            semester_id: selectedTrimester.id,
            semester_index: 1,
            salle_id: 1,
            time_slot: timeSlotObj.slot,
            weeks: 12,
          };
          validSessions.push(session);
        }
      }

      for (const session of validSessions) {
        const response = await apiCall("POST", "/api/sessions/", session, { token });
        if (!response.status) {
          throw new Error(response.message || "Failed to create session");
        }
      }

      message.success("Schedule created successfully");
      onComplete();
    } catch (error) {
      console.error("Error creating schedule:", error);
      message.error(error.message || "Error creating schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTimeSlotSelect = (day, timeSlot, selectedSession) => {
    const normalizedSlot = normalizeTimeSlot(timeSlot);
    const sessions = timeSlots[normalizedSlot] || [];
    return (
      <Select
        style={{ width: "100%" }}
        placeholder="Select session"
        value={
          selectedSession ? `${selectedSession.teacherId}-${selectedSession.moduleId}` : undefined
        }
        onChange={(value) => handleSessionSelect(day, timeSlot, value)}
        showSearch
        optionFilterProp="label"
        notFoundContent="No sessions available"
      >
        {sessions.map((session) => (
          <Select.Option
            key={`${session.teacher_id}-${session.module_id}`}
            value={`${session.teacher_id}-${session.module_id}`}
            label={`${session.module_name} (${session.teacher_name})`}
          >
            {`${session.module_name} (${session.teacher_name})`}
          </Select.Option>
        ))}
      </Select>
    );
  };

  if (!selectedGroup || !selectedTrimester) {
    return (
      <Card className="text-center">
        <p className="text-gray-600">Please select both group and trimester first</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center">
        <h2 className="text-red-500">Error loading time slots</h2>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card title="Build Schedule" className="w-full">
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              {FIXED_DAYS.map((day) => (
                <TableHead key={day}>{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">8:00 - 10:00</TableCell>
              {FIXED_DAYS.map((day) => {
                const timeSlot = TIME_SLOTS_BY_DAY[day][0].slot;
                const selectedSession = selectedSessions[day]?.[timeSlot];
                return (
                  <TableCell key={`${day}-${timeSlot}`}>
                    {renderTimeSlotSelect(day, timeSlot, selectedSession)}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">10:00 - 12:00</TableCell>
              {FIXED_DAYS.map((day) => {
                const timeSlot = TIME_SLOTS_BY_DAY[day][1].slot;
                const selectedSession = selectedSessions[day]?.[timeSlot];
                return (
                  <TableCell key={`${day}-${timeSlot}`}>
                    {renderTimeSlotSelect(day, timeSlot, selectedSession)}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">14:00 - 16:00</TableCell>
              {FIXED_DAYS.map((day) => {
                const timeSlot = TIME_SLOTS_BY_DAY[day][2].slot;
                const selectedSession = selectedSessions[day]?.[timeSlot];
                return (
                  <TableCell key={`${day}-${timeSlot}`}>
                    {renderTimeSlotSelect(day, timeSlot, selectedSession)}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={Object.keys(selectedSessions).length === 0}
          >
            Create Schedule
          </Button>
        </div>
      </div>
    </Card>
  );
}