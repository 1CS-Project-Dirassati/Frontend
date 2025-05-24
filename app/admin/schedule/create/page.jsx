"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, Plus, Save, Trash2, Copy, Wand2 } from "lucide-react";
import { DatePicker, Table, Space } from "antd";
import moment from "moment";

// Static levels
const staticLevels = [
  { id: "1", name: "1st Year" },
  { id: "2", name: "2nd Year" },
  { id: "3", name: "3rd Year" },
];

// Static modules per level
const staticModules = [
  // 1st Year
  { id: "m1", name: "Mathematics I", level_id: "1" },
  { id: "m2", name: "Physics I", level_id: "1" },
  { id: "m3", name: "Programming Fundamentals", level_id: "1" },
  { id: "m4", name: "English I", level_id: "1" },
  // 2nd Year
  { id: "m5", name: "Mathematics II", level_id: "2" },
  { id: "m6", name: "Data Structures", level_id: "2" },
  { id: "m7", name: "Electronics", level_id: "2" },
  { id: "m8", name: "English II", level_id: "2" },
  // 3rd Year
  { id: "m9", name: "Algorithms", level_id: "3" },
  { id: "m10", name: "Database Systems", level_id: "3" },
  { id: "m11", name: "Machine Learning", level_id: "3" },
  { id: "m12", name: "Project Management", level_id: "3" },
];

// Static teachers
const staticTeachers = [
  { id: "t1", first_name: "John", last_name: "Doe" },
  { id: "t2", first_name: "Jane", last_name: "Smith" },
  { id: "t3", first_name: "Alice", last_name: "Johnson" },
  { id: "t4", first_name: "Bob", last_name: "Brown" },
];

// Static rooms
const staticRooms = [
  { id: "r1", name: "Room A101" },
  { id: "r2", name: "Room B202" },
  { id: "r3", name: "Lab C303" },
  { id: "r4", name: "Room D404" },
];

// Static groups per level
const staticGroups = [
  { id: "g1", name: "Group A", level_id: "1" },
  { id: "g2", name: "Group B", level_id: "1" },
  { id: "g3", name: "Group C", level_id: "2" },
  { id: "g4", name: "Group D", level_id: "2" },
  { id: "g5", name: "Group E", level_id: "3" },
  { id: "g6", name: "Group F", level_id: "3" },
];

// Static availability data
const staticAvailability = {
  teachers: {
    t1: {
      Monday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Tuesday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Wednesday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Thursday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Friday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Saturday: { ts1: true, ts2: false, ts3: true, ts4: false, ts5: true },
    },
    t2: {
      Monday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Tuesday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Wednesday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: false },
      Thursday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Friday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Saturday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
    },
    t3: {
      Monday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Tuesday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Wednesday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Thursday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Friday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Saturday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
    },
    t4: {
      Monday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Tuesday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Wednesday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Thursday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Friday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Saturday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
    },
  },
  rooms: {
    r1: {
      Monday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Tuesday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Wednesday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Thursday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Friday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Saturday: { ts1: true, ts2: false, ts3: true, ts4: false, ts5: true },
    },
    r2: {
      Monday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Tuesday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Wednesday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: false },
      Thursday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Friday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Saturday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
    },
    r3: {
      Monday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Tuesday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Wednesday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Thursday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Friday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Saturday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
    },
    r4: {
      Monday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Tuesday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
      Wednesday: { ts1: false, ts2: true, ts3: true, ts4: true, ts5: false },
      Thursday: { ts1: true, ts2: true, ts3: false, ts4: true, ts5: true },
      Friday: { ts1: true, ts2: false, ts3: true, ts4: true, ts5: true },
      Saturday: { ts1: true, ts2: true, ts3: true, ts4: false, ts5: true },
    },
  },
};

// Default trimester options
const defaultTrimesters = [
  {
    name: "Trimester 1",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
  },
  {
    name: "Trimester 2",
    startDate: "2026-01-07",
    endDate: "2026-04-15",
  },
  {
    name: "Trimester 3",
    startDate: "2026-04-20",
    endDate: "2026-07-31",
  },
];

// Steps Component
const Steps = ({ current, items }) => {
  return (
    <div className="flex justify-between items-center w-full">
      {items.map((item, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= current
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                index <= current ? "text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              {item.title}
            </span>
          </div>
          {index < items.length - 1 && (
            <div
              className={`flex-1 h-px mx-4 ${
                index < current ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CreateAdminSchedulePage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [trimesterOption, setTrimesterOption] = useState("");
  const [trimesterName, setTrimesterName] = useState("");
  const [dateRange, setDateRange] = useState(null); // Initialize as null
  const [groupName, setGroupName] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [trimesterData, setTrimesterData] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState({});

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    { id: "ts1", label: "08:00 - 09:30" },
    { id: "ts2", label: "09:45 - 11:15" },
    { id: "ts3", label: "11:30 - 13:00" },
    { id: "ts4", label: "14:00 - 15:30" },
    { id: "ts5", label: "15:45 - 17:15" },
  ];

  // Initialize static data
  useEffect(() => {
    // Set static teachers
    setTeachers(staticTeachers);
    // Set static rooms
    setRooms(staticRooms);
    // Set static availability
    setAvailability(staticAvailability);
  }, []);

  // Update modules and groups when level changes
  useEffect(() => {
    if (selectedLevelId) {
      // Filter static modules by level
      const levelModules = staticModules.filter(
        (module) => module.level_id === selectedLevelId
      );
      setAvailableModules(levelModules);
      setSelectedModules([]);

      // Filter static groups by level
      const levelGroups = staticGroups.filter(
        (group) => group.level_id === selectedLevelId
      );
      setGroups(levelGroups);
      setSelectedGroupId(null);

      // Initialize schedule
      setWeeklySchedule(
        days.reduce(
          (acc, day) => ({
            ...acc,
            [day]: timeSlots.reduce(
              (slotAcc, slot) => ({
                ...slotAcc,
                [slot.id]: { moduleId: "", teacherId: "", roomId: "" },
              }),
              {}
            ),
          }),
          {}
        )
      );
    }
  }, [selectedLevelId]);

  const handleTrimesterChange = (value) => {
    setTrimesterOption(value);
    if (value === "custom") {
      setTrimesterName("");
      setDateRange(null);
    } else {
      const selected = defaultTrimesters.find((t) => t.name === value);
      if (selected) {
        setTrimesterName(selected.name);
        // Store dates as strings
        setDateRange([selected.startDate, selected.endDate]);
      }
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      // Store dates as strings in YYYY-MM-DD format
      setDateRange([
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setDateRange(null);
    }
  };

  const handleAutoGenerateSchedule = () => {
    if (!selectedModules.length) {
      toast.error("Please select at least one module before auto-generating.");
      return;
    }

    // Initialize empty schedule
    const newSchedule = days.reduce(
      (acc, day) => ({
        ...acc,
        [day]: timeSlots.reduce(
          (slotAcc, slot) => ({
            ...slotAcc,
            [slot.id]: { moduleId: "", teacherId: "", roomId: "" },
          }),
          {}
        ),
      }),
      {}
    );

    // Track used teachers and rooms per time slot to avoid conflicts
    const usedResources = days.reduce(
      (acc, day) => ({
        ...acc,
        [day]: timeSlots.reduce(
          (slotAcc, slot) => ({
            ...slotAcc,
            [slot.id]: { teachers: new Set(), rooms: new Set() },
          }),
          {}
        ),
      }),
      {}
    );

    // Ensure at least one slot per day is filled
    days.forEach((day) => {
      let slotsFilled = 0;
      timeSlots.forEach((slot) => {
        // Skip if already filled or randomly skip some slots for variety
        if (Math.random() > 0.6 && slotsFilled > 0) return;

        // Get available modules (randomly select from selectedModules)
        const moduleId =
          selectedModules[Math.floor(Math.random() * selectedModules.length)];
        if (!moduleId) return;

        // Get available teachers for this slot
        const availableTeachers = teachers.filter(
          (teacher) =>
            availability.teachers[teacher.id]?.[day]?.[slot.id] &&
            !usedResources[day][slot.id].teachers.has(teacher.id)
        );
        if (!availableTeachers.length) return;
        const teacherId =
          availableTeachers[
            Math.floor(Math.random() * availableTeachers.length)
          ].id;

        // Get available rooms for this slot
        const availableRooms = rooms.filter(
          (room) =>
            availability.rooms[room.id]?.[day]?.[slot.id] &&
            !usedResources[day][slot.id].rooms.has(room.id)
        );
        if (!availableRooms.length) return;
        const roomId =
          availableRooms[Math.floor(Math.random() * availableRooms.length)].id;

        // Assign to schedule
        newSchedule[day][slot.id] = {
          moduleId,
          teacherId,
          roomId,
        };

        // Mark resources as used
        usedResources[day][slot.id].teachers.add(teacherId);
        usedResources[day][slot.id].rooms.add(roomId);
        slotsFilled++;
      });

      if (slotsFilled === 0) {
        toast.warning(
          `Could not schedule any slots for ${day} due to availability constraints.`
        );
      }
    });

    setWeeklySchedule(newSchedule);
    toast.success("Schedule auto-generated successfully!");
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0 && !selectedLevelId) {
        toast.error("Please select a level.");
        return;
      }
      if (currentStep === 1) {
        if (!trimesterName.trim()) {
          toast.error("Please enter or select a trimester name.");
          return;
        }
        if (!dateRange || dateRange.length !== 2) {
          toast.error("Please select a valid date range.");
          return;
        }
        // Mock trimester creation
        const trimesterPayload = {
          name: trimesterName,
          level_id: parseInt(selectedLevelId),
          start_date: dateRange[0],
          duration: Math.ceil(
            (new Date(dateRange[1]) - new Date(dateRange[0])) /
              (1000 * 60 * 60 * 24 * 7)
          ),
        };
        console.log("Mock trimester payload:", trimesterPayload);

        // Simulate successful response
        const mockResponse = {
          status: true,
          semester: { id: `s${Date.now()}` },
        };

        setTrimesterData({
          id: mockResponse.semester.id,
          name: trimesterName,
          startDate: dateRange[0],
          endDate: dateRange[1],
        });
        toast.success("Trimester created successfully (mocked).");
      }
      if (currentStep === 2 && selectedModules.length === 0) {
        toast.error("Please select at least one module.");
        return;
      }
      if (currentStep === 3 && !selectedGroupId) {
        toast.error("Please select or create a group.");
        return;
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Error in handleNext:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  const handlePrev = () => setCurrentStep(currentStep - 1);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Mock group creation for testing
        const newGroup = {
          id: `g${Date.now()}`,
          name: groupName,
          level_id: selectedLevelId,
        };
        setGroups([...groups, newGroup]);
        setSelectedGroupId(newGroup.id);
        toast.success(
          `Group '${newGroup.name}' created and selected (mocked).`
        );
        setIsGroupModalVisible(false);
        setGroupName("");
        return;
      }
      const groupPayload = {
        name: groupName,
        level_id: parseInt(selectedLevelId),
      };
      const data = await fetch("/api/groups/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupPayload),
      }).then((res) => res.json());
      if (data.status) {
        const newGroup = data.group;
        setGroups([...groups, newGroup]);
        setSelectedGroupId(newGroup.id);
        toast.success(`Group '${newGroup.name}' created and selected.`);
        setIsGroupModalVisible(false);
        setGroupName("");
      } else {
        toast.error(data.message || "Failed to create group.");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Error creating group: " + error.message);
    }
  };

  const handleScheduleCellChange = (day, timeSlotId, field, value) => {
    // Check availability
    if (field === "teacherId" && value) {
      const isAvailable =
        availability.teachers[value]?.[day]?.[timeSlotId] ?? true;
      if (!isAvailable) {
        toast.warning(
          `Teacher is not available on ${day} at ${
            timeSlots.find((ts) => ts.id === timeSlotId).label
          }.`
        );
      }
    }
    if (field === "roomId" && value) {
      const isAvailable =
        availability.rooms[value]?.[day]?.[timeSlotId] ?? true;
      if (!isAvailable) {
        toast.warning(
          `Room is not available on ${day} at ${
            timeSlots.find((ts) => ts.id === timeSlotId).label
          }.`
        );
      }
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

  const handleCopyDay = (sourceDay) => {
    if (!weeklySchedule[sourceDay]) {
      toast.warning(`No schedule to copy from ${sourceDay}.`);
      return;
    }
    const newSchedule = { ...weeklySchedule };
    days.forEach((day) => {
      if (day !== sourceDay) {
        newSchedule[day] = { ...weeklySchedule[sourceDay] };
      }
    });
    setWeeklySchedule(newSchedule);
    toast.success(`Copied ${sourceDay}'s schedule to all other days.`);
  };

  const handleClearDay = (day) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      newSchedule[day] = timeSlots.reduce(
        (acc, slot) => ({
          ...acc,
          [slot.id]: { moduleId: "", teacherId: "", roomId: "" },
        }),
        {}
      );
      return newSchedule;
    });
    toast.info(`Cleared schedule for ${day}.`);
  };

  const handleSaveSchedule = async () => {
    const hasValidSessions = Object.values(weeklySchedule).some((daySchedule) =>
      Object.values(daySchedule).some(
        (session) => session.moduleId && session.teacherId && session.roomId
      )
    );

    if (!hasValidSessions) {
      toast.error(
        "Please schedule at least one complete session (module, teacher, and room)."
      );
      return;
    }

    // Check availability conflicts
    for (const day of days) {
      for (const slot of timeSlots) {
        const session = weeklySchedule[day][slot.id];
        if (session.teacherId && session.roomId) {
          const teacherAvailable =
            availability.teachers[session.teacherId]?.[day]?.[slot.id] ?? true;
          const roomAvailable =
            availability.rooms[session.roomId]?.[day]?.[slot.id] ?? true;
          if (!teacherAvailable) {
            toast.error(`Teacher is not available on ${day} at ${slot.label}.`);
            return;
          }
          if (!roomAvailable) {
            toast.error(`Room is not available on ${day} at ${slot.label}.`);
            return;
          }
        }
      }
    }

    const schedulePayload = {
      levelId: selectedLevelId,
      trimester: trimesterData,
      modules: selectedModules.map((id) =>
        availableModules.find((m) => m.id === id)
      ),
      groupId: selectedGroupId,
      groupName: groups.find((g) => g.id === selectedGroupId)?.name,
      weeklySchedule,
    };

    console.log("Schedule to save:", schedulePayload);
    toast.success("Schedule created successfully!");
    router.push("/admin/schedule");
  };

  // Ant Design Table columns
  const columns = [
    {
      title: "Time Slot",
      dataIndex: "timeSlot",
      key: "timeSlot",
      fixed: "left",
      width: 120,
    },
    ...days.map((day) => ({
      title: (
        <div className="flex items-center space-x-2">
          <span>{day}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyDay(day)}
            title={`Copy ${day}'s schedule`}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClearDay(day)}
            title={`Clear ${day}'s schedule`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
      key: day,
      width: 300,
      render: (_, record) => {
        const session = weeklySchedule[day]?.[record.timeSlotId] || {};
        return (
          <div className="space-y-2">
            <Select
              value={session.moduleId || ""}
              onValueChange={(value) =>
                handleScheduleCellChange(
                  day,
                  record.timeSlotId,
                  "moduleId",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                {selectedModules.map((modId) => {
                  const module = availableModules.find((m) => m.id === modId);
                  return (
                    <SelectItem key={modId} value={modId}>
                      {module?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select
              value={session.teacherId || ""}
              onValueChange={(value) =>
                handleScheduleCellChange(
                  day,
                  record.timeSlotId,
                  "teacherId",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={session.roomId || ""}
              onValueChange={(value) =>
                handleScheduleCellChange(
                  day,
                  record.timeSlotId,
                  "roomId",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
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

  const steps = [
    {
      title: "Select Level",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Choose Academic Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={selectedLevelId || ""}
                onValueChange={setSelectedLevelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {staticLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "Create Trimester",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>
              Trimester Details for{" "}
              {staticLevels.find((l) => l.id === selectedLevelId)?.name ||
                "Selected Level"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trimesterOption">Trimester *</Label>
              <Select
                value={trimesterOption}
                onValueChange={handleTrimesterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trimester" />
                </SelectTrigger>
                <SelectContent>
                  {defaultTrimesters.map((trimester) => (
                    <SelectItem key={trimester.name} value={trimester.name}>
                      {trimester.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {trimesterOption === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="trimesterName">Trimester Name *</Label>
                <Input
                  id="trimesterName"
                  placeholder="e.g., Fall 2025, Trimester 1"
                  value={trimesterName}
                  onChange={(e) => setTrimesterName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Trimester Dates *</Label>
              <DatePicker.RangePicker
                className="w-full"
                onChange={handleDateRangeChange}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
                format="YYYY-MM-DD"
                value={
                  dateRange
                    ? [moment(dateRange[0]), moment(dateRange[1])]
                    : null
                }
                allowEmpty={[true, true]}
                disabled={trimesterOption !== "custom"}
              />
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "Assign Modules",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>
              Assign Modules for {trimesterData?.name || "Trimester"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Modules *</Label>
              <div className="space-y-2">
                {availableModules.map((module) => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={module.id}
                      checked={selectedModules.includes(module.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module.id]);
                        } else {
                          setSelectedModules(
                            selectedModules.filter((id) => id !== module.id)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={module.id} className="text-sm">
                      {module.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "Select/Create Group",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Group for Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Existing Group</Label>
                <Select
                  value={selectedGroupId || ""}
                  onValueChange={setSelectedGroupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label> </Label>
                <Dialog
                  open={isGroupModalVisible}
                  onOpenChange={setIsGroupModalVisible}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupName">Group Name *</Label>
                        <Input
                          id="groupName"
                          placeholder="e.g., Group A, Section 1"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsGroupModalVisible(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateGroup}>
                          Create Group
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      title: "Build Weekly Schedule",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>
              Weekly Schedule for{" "}
              {groups.find((g) => g.id === selectedGroupId)?.name || "Group"} -{" "}
              {trimesterData?.name || "Trimester"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                onClick={handleAutoGenerateSchedule}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Auto-Generate Schedule
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 1500 }}
              bordered
            />
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              Create New Schedule
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/schedule")}
            >
              Back to Schedules
            </Button>
          </div>
          <Steps
            current={currentStep}
            items={steps.map((s) => ({ title: s.title }))}
          />
        </CardContent>
      </Card>

      <div className="mb-6">{steps[currentStep].content}</div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSaveSchedule}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdminSchedulePage;
