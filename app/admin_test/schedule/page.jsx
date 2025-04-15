"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Plus, Trash2, Users } from "lucide-react";
import { studentsData } from "../data/studentsData";

const SortableSession = ({ id, session, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subjectColors = {
    Math: "bg-blue-500",
    Science: "bg-green-500",
    English: "bg-purple-500",
    History: "bg-orange-500",
    Art: "bg-pink-500",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg shadow-md ${
        subjectColors[session.subject] || "bg-secondary"
      } text-background cursor-grab hover:scale-105 transition-all duration-300 flex justify-between items-center`}
    >
      <div>
        <p className="font-semibold">{session.subject}</p>
        <p className="text-sm">{session.teacher}</p>
        <p className="text-sm">{session.room}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(id)}
        className="text-background hover:bg-red-500 hover:text-background"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const SortableCell = ({ id, session }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 border-2 rounded-lg min-h-[100px] bg-background/50 ${
        session ? "border-secondary" : "border-border"
      } transition-all duration-300 hover:bg-accent/10`}
    >
      {session ? (
        <div className="text-text">
          <p className="font-semibold">{session.subject}</p>
          <p className="text-sm">{session.teacher}</p>
          <p className="text-sm">{session.room}</p>
        </div>
      ) : (
        <p className="text-text/50 text-center">Drag session here</p>
      )}
    </div>
  );
};

export default function Schedule() {
  const [grade, setGrade] = useState("9th");
  const [sessions, setSessions] = useState([
    {
      id: "1",
      subject: "Math",
      teacher: "Mr. Smith",
      room: "A-101",
      grade: "9th",
    },
    {
      id: "2",
      subject: "Science",
      teacher: "Ms. Johnson",
      room: "B-202",
      grade: "9th",
    },
    {
      id: "3",
      subject: "English",
      teacher: "Mrs. Brown",
      room: "C-303",
      grade: "10th",
    },
    {
      id: "4",
      subject: "History",
      teacher: "Mr. Davis",
      room: "D-404",
      grade: "10th",
    },
    {
      id: "5",
      subject: "Art",
      teacher: "Ms. Wilson",
      room: "E-505",
      grade: "11th",
    },
  ]);
  const [timetable, setTimetable] = useState({
    Monday: { "08:00": null, "09:00": null, "10:00": null },
    Tuesday: { "08:00": null, "09:00": null, "10:00": null },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: "",
    teacher: "",
    room: "",
    grade,
  });
  const router = useRouter();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const session = sessions.find((s) => s.id === active.id);
    if (!session || session.grade !== grade) return;

    const [day, hour] = over.id.split("-");
    if (timetable[day][hour]) {
      alert("Slot already occupied! Clear it first.");
      return;
    }

    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: session,
      },
    }));
  };

  const addSession = () => {
    if (!newSession.subject || !newSession.teacher || !newSession.room) {
      alert("Please fill all fields.");
      return;
    }
    const id = `${Date.now()}`;
    setSessions([...sessions, { id, ...newSession, grade }]);
    setNewSession({ subject: "", teacher: "", room: "", grade });
    setIsDialogOpen(false);
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
    setTimetable((prev) => {
      const newTimetable = { ...prev };
      Object.keys(newTimetable).forEach((day) => {
        Object.keys(newTimetable[day]).forEach((hour) => {
          if (newTimetable[day][hour]?.id === id) {
            newTimetable[day][hour] = null;
          }
        });
      });
      return newTimetable;
    });
  };

  const clearDay = (day) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: { "08:00": null, "09:00": null, "10:00": null },
    }));
  };

  const days = ["Monday", "Tuesday"];
  const hours = ["08:00", "09:00", "10:00"];

  return (
    <div className="p-4 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-8">
          Weekly Schedule - {grade}
        </h1>
        <Card className="bg-background border-border shadow-xl rounded-xl mb-6">
          <CardHeader>
            <CardTitle className="text-text flex items-center gap-2">
              <Calendar className="w-6 h-6" /> Schedule Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-full sm:w-48 border-border">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {["9th", "10th", "11th", "12th"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g} Grade
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-secondary hover:bg-accent text-background"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Session
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-background border-border shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-text">Available Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sessions
                    .filter((s) => s.grade === grade)
                    .map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sessions
                      .filter((s) => s.grade === grade)
                      .map((session) => (
                        <SortableSession
                          key={session.id}
                          id={session.id}
                          session={session}
                          onDelete={deleteSession}
                        />
                      ))}
                    {sessions.filter((s) => s.grade === grade).length === 0 && (
                      <p className="text-text/50 text-center">
                        No sessions available
                      </p>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
          <Card className="bg-background border-border shadow-xl rounded-xl lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-text">Weekly Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-accent/10">
                      <TableHead className="w-24">Day</TableHead>
                      {hours.map((hour) => (
                        <TableHead key={hour} className="text-center">
                          {hour}
                        </TableHead>
                      ))}
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {days.map((day) => (
                      <TableRow key={day} className="hover:bg-accent/10">
                        <TableCell className="font-semibold text-text">
                          {day}
                        </TableCell>
                        {hours.map((hour) => (
                          <TableCell key={`${day}-${hour}`} className="p-2">
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={[`${day}-${hour}`]}
                                strategy={horizontalListSortingStrategy}
                              >
                                <SortableCell
                                  id={`${day}-${hour}`}
                                  session={timetable[day][hour]}
                                />
                              </SortableContext>
                            </DndContext>
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => clearDay(day)}
                            className="text-red-500 hover:bg-red-500 hover:text-background"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background text-text rounded-lg">
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-text font-semibold">Subject</label>
                <input
                  type="text"
                  value={newSession.subject}
                  onChange={(e) =>
                    setNewSession({ ...newSession, subject: e.target.value })
                  }
                  className="w-full border-border rounded-md p-2 bg-background text-text"
                  placeholder="e.g., Math"
                />
              </div>
              <div>
                <label className="text-text font-semibold">Teacher</label>
                <input
                  type="text"
                  value={newSession.teacher}
                  onChange={(e) =>
                    setNewSession({ ...newSession, teacher: e.target.value })
                  }
                  className="w-full border-border rounded-md p-2 bg-background text-text"
                  placeholder="e.g., Mr. Smith"
                />
              </div>
              <div>
                <label className="text-text font-semibold">Room</label>
                <input
                  type="text"
                  value={newSession.room}
                  onChange={(e) =>
                    setNewSession({ ...newSession, room: e.target.value })
                  }
                  className="w-full border-border rounded-md p-2 bg-background text-text"
                  placeholder="e.g., A-101"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-border hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                onClick={addSession}
                className="bg-secondary hover:bg-accent text-background"
              >
                Add Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
