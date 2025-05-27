
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
import { useSelector } from "react-redux";

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
];

// Static teachers
const staticTeachers = [
  { id: "t1", first_name: "John", last_name: "Doe" },
];

// Static rooms
const staticRooms = [
  { id: "r1", name: "Room A101" },
];

// Static groups per level
const staticGroups = [
  { id: "g1", name: "Group A", level_id: "1" },
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
  const [dateRange, setDateRange] = useState(null);
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState({});

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
    setTeachers(staticTeachers);
    setRooms(staticRooms);
    setAvailability(staticAvailability);
  }, []);

  // Update modules, groups, and schedule when level changes
  useEffect(() => {
    if (selectedLevelId) {
      const levelModules = staticModules.filter(
        (module) => module.level_id === selectedLevelId
      );
      setAvailableModules(levelModules);
      setSelectedModules([]);

      const levelGroups = staticGroups.filter(
        (group) => group.level_id === selectedLevelId
      );
      setGroups(levelGroups);
      setSelectedGroupId(null);

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
      setAvailableTimeSlots({});
    }
  }, [selectedLevelId]);

  // Fetch available time slots when group is selected
  useEffect(() => {
    if (selectedGroupId && currentStep >= 3) {
      const fetchAvailableTimeSlots = async () => {
        try {
          const token = useSelector((state) => state.auth.accessToken);
          const response = await fetch(
            `/api/sessions/group/${selectedGroupId.replace("g", "")}/time-slots`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ).then((res) => res.json());

          if (response.status) {
            setAvailableTimeSlots(response.time_slots);
            toast.success("Available time slots fetched successfully.");
          } else {
            toast.error(response.message || "Failed to fetch available time slots.");
          }
        } catch (error) {
          console.error("Error fetching time slots:", error);
          toast.error("Error fetching time slots: " + error.message);
        }
      };

      fetchAvailableTimeSlots();
    }
  }, [selectedGroupId, currentStep]);

  const handleTrimesterChange = (value) => {
    setTrimesterOption(value);
    if (value === "custom") {
      setTrimesterName("");
      setDateRange(null);
    } else {
      const selected = defaultTrimesters.find((t) => t.name === value);
      if (selected) {
        setTrimesterName(selected.name);
        setDateRange([selected.startDate, selected.endDate]);
      }
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange([
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setDateRange(null);
    }
  };

  const handleWeeksChange = (weeks) => {
    if (weeks && dateRange && dateRange[0]) {
      const startDate = moment(dateRange[0]);
      const endDate = startDate.clone().add(weeks, "weeks");
      setDateRange([
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD"),
      ]);
    }
  };

  const handleAutoGenerateSchedule = () => {
    if (!selectedModules.length) {
      toast.error("Please select at least one module before auto-generating.");
      return;
    }

    const timeSlotMapping = {
      ts1: "h8-10",
      ts2: "h10-12",
      ts3: "h12-14",
      ts4: "h14-16",
      ts5: "h16-18",
    };
    const dayMapping = {
      Monday: "d1",
      Tuesday: "d2",
      Wednesday: "d3",
      Thursday: "d4",
      Friday: "d5",
      Saturday: "d6",
    };

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

    days.forEach((day) => {
      let slotsFilled = 0;
      timeSlots.forEach((slot) => {
        const backendTimeSlot = `${dayMapping[day]}${timeSlotMapping[slot.id]}`;
        const availableSlotInfo = availableTimeSlots[backendTimeSlot] || [];
        if (!availableSlotInfo.length || (Math.random() > 0.6 && slotsFilled > 0))
          return;

        const moduleId =
          selectedModules[Math.floor(Math.random() * selectedModules.length)];
        if (!moduleId) return;

        const availableTeachers = availableSlotInfo
          .filter(
            (info) =>
              info.module_name ===
              staticModules.find((m) => m.id === moduleId)?.name
          )
          .map((info) =>
            teachers.find(
              (t) => `${t.first_name} ${t.last_name}` === info.teacher_name
            )
          )
          .filter((t) => t && !usedResources[day][slot.id].teachers.has(t.id));
        if (!availableTeachers.length) return;
        const teacherId =
          availableTeachers[Math.floor(Math.random() * availableTeachers.length)]
            .id;

        const availableRooms = rooms.filter(
          (room) =>
            availability.rooms[room.id]?.[day]?.[slot.id] &&
            !usedResources[day][slot.id].rooms.has(room.id)
        );
        if (!availableRooms.length) return;
        const roomId =
          availableRooms[Math.floor(Math.random() * availableRooms.length)].id;

        newSchedule[day][slot.id] = {
          moduleId,
          teacherId,
          roomId,
        };

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

        const trimesterPayload = {
          name: trimesterName,
          level_id: parseInt(selectedLevelId),
          start_date: dateRange[0],
          duration: Math.ceil(
            (new Date(dateRange[1]) - new Date(dateRange[0])) /
              (1000 * 60 * 60 * 24 * 7)
          ),
        };

        try {
          const token = localStorage.getItem("token");
          if (!token) {
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
          } else {
            const response = await fetch("/api/semesters", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(trimesterPayload),
            }).then((res) => res.json());

            if (response.status) {
              setTrimesterData({
                id: response.semester.id,
                name: trimesterName,
                startDate: dateRange[0],
                endDate: dateRange[1],
              });
              toast.success("Trimester created successfully.");
            } else {
              toast.error(response.message || "Failed to create trimester.");
              return;
            }
          }
        } catch (error) {
          console.error("Error creating trimester:", error);
          toast.error("Error creating trimester: " + error.message);
          return;
        }
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
    const timeSlotMapping = {
      ts1: "h8-10",
      ts2: "h10-12",
      ts3: "h12-14",
      ts4: "h14-16",
      ts5: "h16-18",
    };
    const dayMapping = {
      Monday: "d1",
      Tuesday: "d2",
      Wednesday: "d3",
      Thursday: "d4",
      Friday: "d5",
      Saturday: "d6",
    };
    const backendTimeSlot = `${dayMapping[day]}${timeSlotMapping[timeSlotId]}`;
    const availableSlotInfo = availableTimeSlots[backendTimeSlot] || [];

    if (field === "teacherId" && value) {
      const teacher = teachers.find((t) => t.id === value);
      const isTeacherAvailable = availableSlotInfo.some(
        (info) => `${teacher.first_name} ${teacher.last_name}` === info.teacher_name
      );
      if (!isTeacherAvailable) {
        toast.warning(
          `Teacher is not available on ${day} at ${
            timeSlots.find((ts) => ts.id === timeSlotId).label
          }.`
        );
        return;
      }
    }
    if (field === "moduleId" && value) {
      const module = availableModules.find((m) => m.id === value);
      const isModuleAvailable = availableSlotInfo.some(
        (info) => info.module_name === module.name
      );
      if (!isModuleAvailable) {
        toast.warning(
          `Module is not available on ${day} at ${
            timeSlots.find((ts) => ts.id === timeSlotId).label
          }.`
        );
        return;
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
        return;
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

    const timeSlotMapping = {
      ts1: "h8-10",
      ts2: "h10-12",
      ts3: "h12-14",
      ts4: "h14-16",
      ts5: "h16-18",
    };
    const dayMapping = {
      Monday: "d1",
      Tuesday: "d2",
      Wednesday: "d3",
      Thursday: "d4",
      Friday: "d5",
      Saturday: "d6",
    };

    const weeks = Math.ceil(
      (new Date(trimesterData.endDate) - new Date(trimesterData.startDate)) /
        (1000 * 60 * 60 * 24 * 7)
    );

    try {
      const token = localStorage.getItem("token");
      const promises = [];

      for (const day of days) {
        for (const slot of timeSlots) {
          const session = weeklySchedule[day][slot.id];
          if (session.moduleId && session.teacherId && session.roomId) {
            const timeSlot = `${dayMapping[day]}${timeSlotMapping[slot.id]}`;
            const sessionPayload = {
              teacher_id: parseInt(session.teacherId.replace("t", "")),
              module_id: parseInt(session.moduleId.replace("m", "")),
              group_id: parseInt(selectedGroupId.replace("g", "")),
              semester_id: parseInt(trimesterData.id.replace("s", "")),
              salle_id: parseInt(session.roomId.replace("r", "")),
              time_slot: timeSlot,
              weeks: weeks,
            };
            promises.push(
              fetch("/api/sessions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sessionPayload),
              }).then((res) => res.json())
            );
          }
        }
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every((result) => result.status);

      if (allSuccessful) {
        toast.success("Schedule saved successfully!");
        router.push("/admin/schedule");
      } else {
        toast.error("Failed to save some sessions.");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error saving schedule: " + error.message);
    }
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
              <Label>Trimester Start Date *</Label>
              <DatePicker
                className="w-full"
                onChange={(date) =>
                  setDateRange([
                    date ? date.format("YYYY-MM-DD") : null,
                    dateRange ? dateRange[1] : null,
                  ])
                }
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
                format="YYYY-MM-DD"
                value={dateRange ? moment(dateRange[0]) : null}
                allowEmpty={[true, true]}
                disabled={trimesterOption !== "custom"}
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Weeks *</Label>
              <Input
                type="number"
                placeholder="e.g., 12"
                onChange={(e) => handleWeeksChange(e.target.value)}
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
