// Mock groups that the teacher is responsible for
export const mockGroups = [
  { id: "g1", name: "Group A" },
  { id: "g2", name: "Group B" },
];

// Mock students per group
const groupStudents = {
  g1: [
    { id: "s1", name: "Alice Johnson" },
    { id: "s2", name: "Bob Smith" },
  ],
  g2: [
    { id: "s3", name: "Charlie Brown" },
    { id: "s4", name: "Diana Prince" },
  ],
};

// Fetch students for a given group (mock)
export function getStudentsForGroup(groupId) {
  return Promise.resolve(groupStudents[groupId] || []);
}

// Mock modules that the teacher is responsible for
export const mockModules = [
  { id: "m1", name: "Mathematics I", groupIds: ["g1"] },
  { id: "m2", name: "Physics I", groupIds: ["g1", "g2"] },
  { id: "m3", name: "Chemistry", groupIds: ["g2"] },
];

// Fetch modules for the teacher (mock)
export function getModulesForTeacher() {
  return Promise.resolve(mockModules);
}
