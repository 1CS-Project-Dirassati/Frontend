"use client";

import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, message } from "antd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Copy, Trash2 } from "lucide-react";
import apiCall from "@/components/utils/apiCall";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const timeSlots = [
  { id: "ts1", label: "08:00 - 10:00", backend: "h8-10" },
  { id: "ts2", label: "10:00 - 12:00", backend: "h10-12" },
  { id: "ts4", label: "14:00 - 16:00", backend: "h14-16" },
];

const dayMap = {
  Sunday: "d1",
  Monday: "d2",
  Tuesday: "d3",
  Wednesday: "d4",
  Thursday: "d5",
};

const defaultMessages = {
  success: {
    loadData: "Data loaded successfully.",
    autoGenerate: "Schedule auto-generated.",
    copyDay: "Copied schedule from {day}.",
    clearDay: "Cleared schedule for {day}.",
  },
  errors: {
    loadDataFailed: "Failed to load data.",
    invalidSlot: "Invalid selection for {day} at {time}.",
  },
};

const ScheduleBuilder = ({
  t,
  token,
  selectedGroupId,
  trimesterData,
  groups,
  availableModules,
  selectedModules,
  weeklySchedule,
  setWeeklySchedule,
  teachers,
  rooms,
  availableTimeSlots,
  setAvailableTimeSlots,
  isLoading,
}) => {
  const mergedT = {
    ...defaultMessages,
    ...t,
    success: { ...defaultMessages.success, ...(t?.success || {}) },
    errors: { ...defaultMessages.errors, ...(t?.errors || {}) },
  };

  const fetchedGroupRef = useRef(null); // Track last fetched group

  useEffect(() => {
    if (selectedGroupId && fetchedGroupRef.current !== selectedGroupId) {
      const fetchAvailableTimeSlots = async () => {
        try {
          const response = await apiCall(
            "get",
            `/api/sessions/group/${selectedGroupId}/time-slots`,
            null,
            { token }
          );
          console.log("Available time slots:", response);
          setAvailableTimeSlots(response.time_slots || {});
          message.success(mergedT.success.loadData);
          fetchedGroupRef.current = selectedGroupId; // mark as fetched
        } catch (error) {
          console.error("Error fetching time slots:", error);
          message.error(mergedT.errors.loadDataFailed);
        }
      };
      fetchAvailableTimeSlots();
    }
  }, [selectedGroupId]);

  const backendSlotId = (day, slotId) =>
    `${dayMap[day]}${timeSlots.find((s) => s.id === slotId)?.backend}`;

  const handleScheduleCellChange = (day, timeSlotId, field, value) => {
    const backendId = backendSlotId(day, timeSlotId);
    const availableSlot = availableTimeSlots[backendId] || [];

    const validate = () => {
      if (field === "moduleId") {
        const module = availableModules.find((m) => m.id === Number(value));
        return availableSlot.some((s) => s.module_name === module?.name);
      }
      if (field === "teacherId") {
        const teacher = teachers.find((t) => t.id === Number(value));
        const fullName = `${teacher?.first_name} ${teacher?.last_name}`;
        return availableSlot.some((s) => s.teacher_name === fullName);
      }
      if (field === "roomId") {
        const room = rooms.find((r) => r.id === Number(value));
        return availableSlot.some((s) => s.salle_name === room?.name);
      }
      return true;
    };

    if (!validate()) {
      const errorTemplate =
        mergedT.errors.invalidSlot || "Invalid selection for {day} at {time}.";
      const slotLabel =
        timeSlots.find((s) => s.id === timeSlotId)?.label || timeSlotId;
      return message.warning(
        errorTemplate.replace("{day}", day).replace("{time}", slotLabel)
      );
    }

    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeSlotId]: {
          ...prev[day][timeSlotId],
          [field]: value,
        },
      },
    }));
  };

  const handleAutoGenerateSchedule = () => {
    const newSchedule = {};
    const usedTeachers = {};
    const usedRooms = {};

    days.forEach((day) => {
      newSchedule[day] = {};
      timeSlots.forEach((slot) => {
        const backendId = backendSlotId(day, slot.id);
        const options = availableTimeSlots[backendId] || [];

        const option = options.find((o) => {
          const teacher = teachers.find(
            (t) => `${t.first_name} ${t.last_name}` === o.teacher_name
          );
          const room = rooms.find((r) => r.name === o.salle_name);
          const module = availableModules.find((m) => m.name === o.module_name);

          if (
            !teacher ||
            !room ||
            !module ||
            usedTeachers[`${day}-${teacher.id}`] ||
            usedRooms[`${day}-${room.id}`]
          ) {
            return false;
          }

          if (!selectedModules.includes(module.id)) return false;

          usedTeachers[`${day}-${teacher.id}`] = true;
          usedRooms[`${day}-${room.id}`] = true;

          newSchedule[day][slot.id] = {
            moduleId: module.id,
            teacherId: teacher.id,
            roomId: room.id,
          };
          return true;
        });

        if (!option) {
          newSchedule[day][slot.id] = {
            moduleId: "",
            teacherId: "",
            roomId: "",
          };
        }
      });
    });

    setWeeklySchedule(newSchedule);
    message.success(mergedT.success.autoGenerate);
  };

  const handleCopyDay = (sourceDay) => {
    const copy = { ...weeklySchedule[sourceDay] };
    const updated = days.reduce((acc, d) => {
      acc[d] = d === sourceDay ? weeklySchedule[d] : { ...copy };
      return acc;
    }, {});
    setWeeklySchedule(updated);
    message.success(mergedT.success.copyDay.replace("{day}", sourceDay));
  };

  const handleClearDay = (day) => {
    const cleared = timeSlots.reduce((acc, slot) => {
      acc[slot.id] = { moduleId: "", teacherId: "", roomId: "" };
      return acc;
    }, {});
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: cleared,
    }));
    message.info(mergedT.success.clearDay.replace("{day}", day));
  };

  const columns = [
    {
      title: mergedT.timeSlot,
      dataIndex: "timeSlot",
      key: "timeSlot",
      fixed: "left",
      width: 120,
    },
    ...days.map((day) => ({
      title: (
        <div className="flex items-center space-x-2">
          <span>{day}</span>
          <Button variant="ghost" size="sm" onClick={() => handleCopyDay(day)}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleClearDay(day)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ),
      key: day,
      width: 300,
      render: (_, record) => {
        const session = weeklySchedule?.[day]?.[record.timeSlotId] || {};
        return (
          <div className="space-y-1">
            <Select
              value={String(session.moduleId || "")}
              onValueChange={(val) =>
                handleScheduleCellChange(
                  day,
                  record.timeSlotId,
                  "moduleId",
                  val
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={mergedT.module} />
              </SelectTrigger>
              <SelectContent>
                {selectedModules.map((id) => {
                  const m = availableModules.find((m) => m.id === id);
                  return (
                    <SelectItem key={id} value={String(id)}>
                      {m?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select
              value={String(session.teacherId || "")}
              onValueChange={(val) =>
                handleScheduleCellChange(
                  day,
                  record.timeSlotId,
                  "teacherId",
                  val
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={mergedT.teacher} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.first_name} {t.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(session.roomId || "")}
              onValueChange={(val) =>
                handleScheduleCellChange(day, record.timeSlotId, "roomId", val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={mergedT.room} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    })),
  ];

  const dataSource = timeSlots.map((slot) => ({
    key: slot.id,
    timeSlot: slot.label,
    timeSlotId: slot.id,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mergedT.steps.buildSchedule} –{" "}
          {groups.find((g) => g.id === Number(selectedGroupId))?.name ||
            "Group"}{" "}
          | {trimesterData?.name || "Trimester"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button
            onClick={handleAutoGenerateSchedule}
            className="bg-indigo-600"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {mergedT.autoGenerate}
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 1500 }}
          bordered
          loading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ScheduleBuilder;
