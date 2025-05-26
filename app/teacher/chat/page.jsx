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
  const [selectedTeacher, setSelectedTeacher] = useState({}); // Default: Fatima Haddad
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Redux selector for token
  const token = useSelector((state) => state.auth.accessToken);
 const TeacherID = useSelector((state)=>state.userinfo.userProfile.id) 

  // Hardcoded students
  const students = [
    { id: "s1", first_name: "Amina", last_name: "Bouchama" },
    { id: "s2", first_name: "Youssef", last_name: "Bouchama" },
  ];

  // Hardcoded teachers
  const [teachers, setTeachers] = useState([]);

  // Remove static messages and initialize messages as an empty array
  const [messages, setMessages] = useState([]);

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
          id: chat.id,
          teacher_id: chat.teacher_id,
          name: `${chat.parent_name}`, // Replace with actual teacher name if available
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
  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    

    try{
     const result = await apiCall("post", `/api/messages/`, {
        chat_id: selectedTeacher.id,
        content: messageInput,
        sender_id: TeacherID,
        sender_role: "parent",
      }, {
        token,
      });

      handleChatMessages(selectedTeacher.id);

    }
    catch (error) {

    }
    const newMessage = {
      sender: "parent",
      text: messageInput,
      timestamp: new Date().toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };

    setMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    setMessageInput("");
    setIsTyping(true);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && messageInput.trim()) {
      sendMessage();
    }
  };

  // Get current messages
  const currentMessages = messages || [];

  // Get initials for avatars
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Debugging logs
  useEffect(() => {
    console.log("Selected Teacher:", selectedTeacher);
    console.log("Messages:", messages);
    console.log("Current Messages:", currentMessages);
  }, [selectedTeacher, messages, currentMessages]);


  // Update handleChatMessages to fetch and sort messages by created_at
  const handleChatMessages = async (teacherId) => {
    try {
      const result = await apiCall(
        "get",
        `/api/messages/?chat_id=${teacherId}&page=1&per_page=20`,
        null,
        {
          token,
        }
      );

      // Transform the API response to match the messages format
      const transformedMessages = result.messages.map((msg) => ({
        sender: msg.sender_role === "parent" ? "parent" : "teacher",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        createdAt: new Date(msg.created_at),
      }));

      // Sort messages by created_at
      const sortedMessages = transformedMessages.sort((a, b) => a.createdAt - b.createdAt);

      // Update the messages state
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  }

  // Add polling to fetch messages every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (selectedTeacher.id) {
      handleChatMessages(selectedTeacher.id);
    }
  }, 1000); // Fetch messages every 5 seconds

  return () => clearInterval(interval); // Cleanup interval on component unmount
}, [selectedTeacher]);

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
            Discussion avec les parents
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
                  parents
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
                          selectedTeacher.id === teacher.id ? "default" : "ghost"
                        }
                        className={`w-full justify-start rounded-lg ${
                          selectedTeacher.id === teacher.id
                            ? "bg-[#0771CB] hover:bg-[#055a9e] text-white"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                        onClick={() =>{ 
                          setSelectedTeacher({ id: teacher.id, teacherId: teacher.teacher_id })
                          handleChatMessages(teacher.id);
                      
                      }}
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
                  {teachers.find((t) => t.id === selectedTeacher.id)?.name}
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
                          msg.sender === "teacher"
                            ? "justify-end"
                            : "justify-start"
                        } mb-4 items-end`}
                      >
                        <div className="flex items-end gap-2">
                          {msg.sender === "parent" && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                              {getInitials(
                                teachers.find((t) => t.id === selectedTeacher.id)
                                  ?.name || "P"
                              )}
                            </div>
                          )}
                          <div
                            className={`relative max-w-[70%] p-3 rounded-lg shadow-sm ${
                              msg.sender === "teacher"
                                ? "bg-[#0771CB] text-white"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {/* Tail for message bubble */}
                            <div
                              className={`absolute bottom-0 w-0 h-0 border-t-8 border-t-transparent ${
                                msg.sender === "teacher"
                                  ? "right-[-8px] border-l-8 border-l-[#0771CB]"
                                  : "left-[-8px] border-r-8 border-r-slate-200"
                              }`}
                            />
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.timestamp}
                            </p>
                          </div>
                          {msg.sender === "teacher" && (
                            <div className="w-8 h-8 rounded-full bg-[#0771CB] flex items-center justify-center text-white font-semibold">
                              {getInitials("Teacher")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center">Aucun message</p>
                  )}
                  <AnimatePresence>
                    {/* Removed typing indicator */}
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
