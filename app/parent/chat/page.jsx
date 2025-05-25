"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
export default function ParentTeacherChat({ user }) {
  const [selectedChild, setSelectedChild] = useState("s1"); // Default: Amina
  const [selectedTeacher, setSelectedTeacher] = useState("1"); // Default: Fatima Haddad
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Redux selector for token
  const token = useSelector((state) => state.auth.accessToken);

  // Hardcoded students
  const students = [
    { id: "s1", first_name: "Amina", last_name: "Bouchama" },
    { id: "s2", first_name: "Youssef", last_name: "Bouchama" },
  ];

  // Hardcoded teachers
  const [teachers, setTeachers] = useState([
    { id: "1", name: "Fatima Haddad", subject: "Arabe" },
    { id: "2", name: "Yassine Saghir", subject: "Mathématiques" },
    { id: "3", name: "Khadija Ben Omar", subject: "Français" },
    { id: "4", name: "Mohamed Kharroubi", subject: "Sciences" },
    { id: "5", name: "Leila Bouziane", subject: "Anglais" },
  ]);

  // Initial messages (hardcoded)
  const initialMessages = {
    s1: {
      1: [
        {
          sender: "parent",
          text: "Bonjour, comment Amina se débrouille-t-elle en arabe ?",
          timestamp: "2025-05-04 10:00",
        },
        {
          sender: "teacher",
          text: "Amina va bien, mais elle peut améliorer ses compétences en écriture.",
          timestamp: "2025-05-04 10:05",
        },
        {
          sender: "parent",
          text: "Merci, y a-t-il des exercices supplémentaires qu’elle pourrait faire ?",
          timestamp: "2025-05-04 10:10",
        },
        {
          sender: "teacher",
          text: "Bien sûr, je vous enverrai quelques exercices.",
          timestamp: "2025-05-04 10:15",
        },
      ],
      2: [
        {
          sender: "parent",
          text: "Pouvons-nous discuter des progrès d’Amina en mathématiques ?",
          timestamp: "2025-05-04 11:00",
        },
        {
          sender: "teacher",
          text: "Amina excelle en calcul, mais doit se concentrer sur la géométrie.",
          timestamp: "2025-05-04 11:05",
        },
      ],
      3: [
        {
          sender: "parent",
          text: "Comment va Amina en français ?",
          timestamp: "2025-05-04 12:00",
        },
        {
          sender: "teacher",
          text: "Elle progresse bien, je lui conseille de lire davantage en français.",
          timestamp: "2025-05-04 12:10",
        },
      ],
      4: [
        {
          sender: "parent",
          text: "Des remarques sur les performances d’Amina en sciences ?",
          timestamp: "2025-05-04 13:00",
        },
        {
          sender: "teacher",
          text: "Amina est très active dans les travaux pratiques !",
          timestamp: "2025-05-04 13:05",
        },
      ],
      5: [
        {
          sender: "parent",
          text: "Comment Amina se débrouille-t-elle en anglais ?",
          timestamp: "2025-05-04 14:00",
        },
        {
          sender: "teacher",
          text: "Elle est excellente en conversation, mais peut améliorer la grammaire.",
          timestamp: "2025-05-04 14:05",
        },
      ],
    },
    s2: {
      1: [
        {
          sender: "parent",
          text: "Bonjour, comment Youssef s’en sort-il en arabe ?",
          timestamp: "2025-05-04 10:30",
        },
        {
          sender: "teacher",
          text: "Youssef doit améliorer sa lecture, mais il est bon à l’oral.",
          timestamp: "2025-05-04 10:35",
        },
      ],
      2: [
        {
          sender: "parent",
          text: "Pouvons-nous parler des notes de Youssef en mathématiques ?",
          timestamp: "2025-05-04 11:30",
        },
        {
          sender: "teacher",
          text: "Youssef est fort en algèbre, mais doit pratiquer les statistiques.",
          timestamp: "2025-05-04 11:35",
        },
      ],
      3: [
        {
          sender: "parent",
          text: "Comment Youssef va-t-il en français ?",
          timestamp: "2025-05-04 12:30",
        },
        {
          sender: "teacher",
          text: "Il s’améliore, mais a besoin de plus de pratique.",
          timestamp: "2025-05-04 12:35",
        },
      ],
      4: [
        {
          sender: "parent",
          text: "Pouvons-nous discuter des progrès de Youssef en sciences ?",
          timestamp: "2025-05-04 13:30",
        },
        {
          sender: "teacher",
          text: "Youssef est très intéressé par les expériences scientifiques !",
          timestamp: "2025-05-04 13:35",
        },
      ],
      5: [
        {
          sender: "parent",
          text: "Comment Youssef s’en sort-il en anglais ?",
          timestamp: "2025-05-04 14:30",
        },
        {
          sender: "teacher",
          text: "Il est bon en écriture, mais doit améliorer sa prononciation.",
          timestamp: "2025-05-04 14:35",
        },
      ],
    },
  };

  // State for messages
  const [messages, setMessages] = useState(initialMessages);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedChild, selectedTeacher]);

  // Check parent access
  useEffect(() => {
    if (user && user.role !== "parent") {
      alert("Vous n’êtes pas autorisé à accéder à cette page");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [user]);

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await apiCall("get", "/api/chats/?page=1&per_page=10", null, {
          token,
        });
        const teacherChats = response.chats.map((chat) => ({
          id: chat.teacher_id,
          name: `Teacher ${chat.teacher_id}`, // Replace with actual teacher name if available
          subject: "Unknown", // Replace with actual subject if available
        }));
        setTeachers(teacherChats);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

   
      fetchTeachers();
    
  }, []);

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      sender: "parent",
      text: messageInput,
      timestamp: new Date().toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChild]: {
        ...prev[selectedChild],
        [selectedTeacher]: [
          ...(prev[selectedChild][selectedTeacher] || []),
          newMessage,
        ],
      },
    }));

    setMessageInput("");
    setIsTyping(true);

    // Mock teacher response (for demo)
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedChild]: {
          ...prev[selectedChild],
          [selectedTeacher]: [
            ...(prev[selectedChild][selectedTeacher] || []),
            {
              sender: "teacher",
              text: "Merci pour votre message, je vais vérifier et vous répondre bientôt.",
              timestamp: new Date().toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              }),
            },
          ],
        },
      }));
      setIsTyping(false);
    }, 1500);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && messageInput.trim()) {
      sendMessage();
    }
  };

  // Get current messages
  const currentMessages = messages[selectedChild]?.[selectedTeacher] || [];

  // Get initials for avatars
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading || (user && user.role !== "parent")) {
    return <div className="p-6 text-center text-slate-800">Chargement...</div>;
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-beige-100 to-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-slate-800"
          >
            Discussion avec les enseignants
          </motion.h1>
          {/* <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-48 border-slate-300 rounded-lg shadow-sm">
              <SelectValue placeholder="Sélectionner l’élève" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: Teacher List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4"
          >
            <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-slate-600" />
                  Enseignants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <motion.div
                      key={teacher.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={
                          selectedTeacher === teacher.id ? "default" : "ghost"
                        }
                        className={`w-full justify-start rounded-lg ${
                          selectedTeacher === teacher.id
                            ? "bg-[#0771CB] hover:bg-[#055a9e] text-white"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                        onClick={() => setSelectedTeacher(teacher.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                            {getInitials(teacher.name)}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{teacher.name}</p>
                            <p className="text-sm opacity-70">
                              {teacher.subject}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Main Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-3/4"
          >
            <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Conversation -{" "}
                  {teachers.find((t) => t.id === selectedTeacher)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={chatContainerRef}
                  className="h-[500px] overflow-y-auto mb-4 p-4 bg-[#F5F5F5] rounded-lg"
                >
                  {currentMessages.length > 0 ? (
                    currentMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`flex ${
                          msg.sender === "parent"
                            ? "justify-end"
                            : "justify-start"
                        } mb-4 items-end`}
                      >
                        <div className="flex items-end gap-2">
                          {msg.sender === "teacher" && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                              {getInitials(
                                teachers.find((t) => t.id === selectedTeacher)
                                  ?.name || "T"
                              )}
                            </div>
                          )}
                          <div
                            className={`relative max-w-[70%] p-3 rounded-lg shadow-sm ${
                              msg.sender === "parent"
                                ? "bg-[#0771CB] text-white"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {/* Tail for message bubble */}
                            <div
                              className={`absolute bottom-0 w-0 h-0 border-t-8 border-t-transparent ${
                                msg.sender === "parent"
                                  ? "right-[-8px] border-l-8 border-l-[#0771CB]"
                                  : "left-[-8px] border-r-8 border-r-slate-200"
                              }`}
                            />
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.timestamp}
                            </p>
                          </div>
                          {msg.sender === "parent" && (
                            <div className="w-8 h-8 rounded-full bg-[#0771CB] flex items-center justify-center text-white font-semibold">
                              {getInitials("Parent")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center">Aucun message</p>
                  )}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-start mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                            {getInitials(
                              teachers.find((t) => t.id === selectedTeacher)
                                ?.name || "T"
                            )}
                          </div>
                          <div className="bg-slate-200 p-3 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-slate-600 ml-2">
                              En train d’écrire...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2 sticky bottom-0 bg-white/90 p-2 rounded-lg">
                  <Input
                    placeholder="Écrivez votre message ici..."
                    className="border-slate-300 rounded-lg shadow-sm"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    className="bg-[#0771CB] hover:bg-[#055a9e] text-white rounded-lg"
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
