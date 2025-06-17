"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

export default function ParentTeacherChat({ user }) {
  const [selectedChild, setSelectedChild] = useState("s1"); // Default: Amina
  const [selectedParent, setSelectedParent] = useState({}); // Selected parent
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [filteredParents, setFilteredParents] = useState([]); // Filtered parent list for sidebar
  const [allParents, setAllParents] = useState([]); // All parents (with and without chats)
  const chatContainerRef = useRef(null);

  // Redux selectors
  const token = useSelector((state) => state.auth.accessToken);
  const teacherId = useSelector((state) => state.userinfo.userProfile.id);

  // Hardcoded students (unchanged)
  const students = [
    { id: "s1", first_name: "Amina", last_name: "Bouchama" },
    { id: "s2", first_name: "Youssef", last_name: "Bouchama" },
  ];

  // State for messages
  const [messages, setMessages] = useState([]);

  // Static fallback parent data
  const staticParents = [
    {
      id: "p1",
      parent_id: "p1",
      first_name: "Fatima",
      last_name: "Haddad",
      email: "fatima.haddad@example.com",
      name: "Fatima Haddad",
      hasChat: false,
    },
    {
      id: "p2",
      parent_id: "p2",
      first_name: "Mohamed",
      last_name: "Amrani",
      email: "mohamed.amrani@example.com",
      name: "Mohamed Amrani",
      hasChat: false,
    },
  ];

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedParent]);

  // Check parent access
  useEffect(() => {
    if (user && user.role !== "parent") {
      alert("Vous n’êtes pas autorisé à accéder à cette page");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [user]);

  // Fetch existing chats and all parents
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch existing chats
        const chatResponse = await apiCall("get", "/api/chats/?page=1&per_page=10", null, { token });
        const parentChats = chatResponse.chats.map((chat) => ({
          id: chat.id,
          parent_id: chat.parent_id,
          first_name: chat.parent_name.split(" ")[0] || "Unknown",
          last_name: chat.parent_name.split(" ")[1] || "",
          name: chat.parent_name,
          hasChat: true,
        }));

        // Fetch all parents
        const parentResponse = await apiCall(
          "get",
          `/api/parents/?teacher_id=${teacherId}&page=1&per_page=10`,
          null,
          { token }
        );
        const allParentsData = parentResponse.parents.map((parent) => ({
          id: parent.id,
          parent_id: parent.id,
          first_name: parent.first_name,
          last_name: parent.last_name,
          name: `${parent.first_name} ${parent.last_name}`,
          email: parent.email,
          hasChat: parentChats.some((chat) => chat.parent_id === parent.id),
        }));

        // Combine chats and parents
        const combinedParents = [
          ...parentChats,
          ...allParentsData.filter((p) => !parentChats.some((chat) => chat.parent_id === p.parent_id)),
        ];

        setAllParents(combinedParents.length > 0 ? combinedParents : staticParents);
        setFilteredParents(combinedParents.length > 0 ? combinedParents.filter((p) => p.hasChat) : staticParents.filter((p) => p.hasChat));
      } catch (error) {
        console.error("Error fetching data:", error);
        setAllParents(staticParents);
        setFilteredParents(staticParents.filter((p) => p.hasChat));
      }
    };

    fetchData();
  }, [token, teacherId]);

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() === "") {
        // Show only parents with existing chats when no search query
        setFilteredParents(allParents.filter((p) => p.hasChat));
      } else {
        // Filter all parents (with and without chats) based on search query
        const query = searchQuery.toLowerCase();
        const filtered = allParents.filter(
          (parent) =>
            parent.first_name.toLowerCase().includes(query) ||
            parent.last_name.toLowerCase().includes(query) ||
            parent.name.toLowerCase().includes(query)
        );
        setFilteredParents(filtered);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, allParents]);

  // Create new chat
  const createChat = async (parentId) => {
    try {
      const response = await apiCall(
        "post",
        "/api/chats/",
        { parent_id: parentId },
        { token }
      );
      return response.chat_id; // Assume API returns the new chat ID
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  // Handle parent selection
  const handleParentSelect = async (parent) => {
    setSelectedParent({ id: parent.id, parentId: parent.parent_id });
    if (parent.hasChat) {
      handleChatMessages(parent.id);
    } else {
      const newChatId = await createChat(parent.parent_id);
      if (newChatId) {
        setSelectedParent({ id: newChatId, parentId: parent.parent_id });
        handleChatMessages(newChatId);
        // Update allParents to mark this parent as having a chat
        setAllParents((prev) =>
          prev.map((p) =>
            p.parent_id === parent.parent_id ? { ...p, hasChat: true, id: newChatId } : p
          )
        );
        // Update filteredParents to include the new chat parent
        setFilteredParents((prev) =>
          prev.some((p) => p.parent_id === parent.parent_id)
            ? prev.map((p) =>
                p.parent_id === parent.parent_id ? { ...p, hasChat: true, id: newChatId } : p
              )
            : [...prev, { ...parent, hasChat: true, id: newChatId }]
        );
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedParent.id) return;

    try {
      await apiCall(
        "post",
        `/api/messages/`,
        {
          chat_id: selectedParent.id,
          content: messageInput,
          sender_id: teacherId,
          sender_role: "parent",
        },
        { token }
      );

      handleChatMessages(selectedParent.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    const newMessage = {
      sender: "parent",
      text: messageInput,
      timestamp: new Date().toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setIsTyping(true);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && messageInput.trim()) {
      sendMessage();
    }
  };

  // Fetch and sort messages by created_at
  const handleChatMessages = async (chatId) => {
    try {
      const result = await apiCall(
        "get",
        `/api/messages/?chat_id=${chatId}&page=1&per_page=20`,
        null,
        { token }
      );

      const transformedMessages = result.messages.map((msg) => ({
        sender: msg.sender_role === "parent" ? "parent" : "teacher",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        createdAt: new Date(msg.created_at),
      }));

      const sortedMessages = transformedMessages.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  // Polling for messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedParent.id) {
        handleChatMessages(selectedParent.id);
      }
    }, 5000); // Fetch messages every 5 seconds

    return () => clearInterval(interval);
  }, [selectedParent]);

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
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-slate-800 mb-8"
        >
          Discussion avec les parents
        </motion.h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: Parent List with Search */}
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
                  Parents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <Input
                  placeholder="Rechercher un parent..."
                  className="mb-4 border-slate-300 rounded-lg shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredParents.length > 0 ? (
                    filteredParents.map((parent) => (
                      <motion.div
                        key={parent.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={
                            selectedParent.id === parent.id ? "default" : "ghost"
                          }
                          className={`w-full justify-start rounded-lg ${
                            selectedParent.id === parent.id
                              ? "bg-[#0771CB] hover:bg-[#055a9e] text-white"
                              : "text-slate-800 hover:bg-slate-100"
                          }`}
                          onClick={() => handleParentSelect(parent)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                              {getInitials(parent.name)}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">
                                {parent.first_name} {parent.last_name}
                                {!parent.hasChat && searchQuery ? " (Nouveau)" : ""}
                              </p>
                              <p className="text-sm opacity-70">
                                {parent.hasChat ? "Chat existant" : searchQuery ? "Nouveau chat" : ""}
                              </p>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center">Aucun parent trouvé</p>
                  )}
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
                  {allParents.find((p) => p.id === selectedParent.id)?.name ||
                    "Sélectionnez un parent"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={chatContainerRef}
                  className="h-[500px] overflow-y-auto mb-4 p-4 bg-[#F5F5F5] rounded-lg"
                >
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
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
                          msg.sender === "teacher" ? "justify-end" : "justify-start"
                        } mb-4 items-end`}
                      >
                        <div className="flex items-end gap-2">
                          {msg.sender === "parent" && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-semibold">
                              {getInitials(
                                allParents.find((p) => p.id === selectedParent.id)?.name || "P"
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
                            <div
                              className={`absolute bottom-0 w-0 h-0 border-t-8 border-t-transparent ${
                                msg.sender === "teacher"
                                  ? "right-[-8px] border-l-8 border-l-[#0771CB]"
                                  : "left-[-8px] border-r-8 border-r-slate-200"
                              }`}
                            />
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
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
                    disabled={!messageInput.trim() || !selectedParent.id}
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