// Mock data for teacher attendance

export const mockTeacherSchedule = [
  {
    id: "sched1",
    day: "Monday",
    time: "08:00 - 10:00",
    module: "Mathematics",
    group: "Group A",
    room: "Room 101",
    level: "Level 1",
  },
  {
    id: "sched2",
    day: "Monday",
    time: "10:30 - 12:30",
    module: "Physics",
    group: "Group B",
    room: "Room 102",
    level: "Level 1",
  },
  {
    id: "sched3",
    day: "Tuesday",
    time: "14:00 - 16:00",
    module: "Mathematics",
    group: "Group A",
    room: "Room 101",
    level: "Level 1",
  },
  {
    id: "sched4",
    day: "Wednesday",
    time: "08:00 - 10:00",
    module: "Chemistry",
    group: "Group C",
    room: "Room 103",
    level: "Level 2",
  },
  {
    id: "sched5",
    day: "Thursday",
    time: "10:30 - 12:30",
    module: "Physics",
    group: "Group B",
    room: "Room 102",
    level: "Level 1",
  },
];

export const mockStudents = {
  "Group A": [
    { id: "stud1", name: "Alice Smith", present: true },
    { id: "stud2", name: "Bob Johnson", present: true },
    { id: "stud3", name: "Charlie Brown", present: true },
  ],
  "Group B": [
    { id: "stud4", name: "Diana Prince", present: true },
    { id: "stud5", name: "Edward Nigma", present: true },
  ],
  "Group C": [
    { id: "stud6", name: "Fiona Gallagher", present: true },
    { id: "stud7", name: "George Costanza", present: true },
    { id: "stud8", name: "Hannah Montana", present: true },
  ],
};

// Simulate fetching students for a specific session (group)
export const getStudentsForSession = (groupId) => {
  return mockStudents[groupId] || [];
};
