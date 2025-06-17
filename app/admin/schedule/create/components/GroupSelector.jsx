"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
//import { translations } from "../utils/translations";
import { message } from "antd";
import apiCall from "@/components/utils/apiCall";
import { useSelector } from "react-redux";
import { Spin } from "antd";

const { Option } = Select;

export default function GroupSelector({ selectedLevel, onGroupSelect, onNext }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token || !selectedLevel?.id) {
        setGroups([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `/api/groups/?level_id=${selectedLevel.id}&page=${currentPage}`,
          null,
          { token }
        );

        if (response?.status && Array.isArray(response?.groups)) {
          if (currentPage === 1) {
            setGroups(response.groups);
          } else {
            setGroups(prev => [...(prev || []), ...response.groups]);
          }
          setHasMore(response.has_next);
        } else {
          setError("Failed to fetch groups");
          message.error("Failed to fetch groups");
          setGroups([]);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError(error.message);
        message.error("Error loading groups");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token, selectedLevel, currentPage]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      message.error("Please enter a group name");
      return;
    }

    try {
      const groupPayload = {
        name: groupName,
        level_id: selectedLevel.id,
      };

      const response = await apiCall(
        'POST',
        '/api/groups/',
        groupPayload,
        { token }
      );

      if (response?.status && response?.group) {
        setGroups(prev => [...(prev || []), response.group]);
        setSelectedGroup(response.group);
        onGroupSelect(response.group);
        message.success("Group created successfully");
        setIsGroupModalVisible(false);
        setGroupName("");
      } else {
        message.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      message.error("Error creating group");
    }
  };

  const handleGroupChange = (value) => {
    console.log('Group change value:', value);
    const selected = groups?.find(g => g.id.toString() === value.toString());
    console.log('Found group:', selected);
    if (selected) {
      setSelectedGroup(selected);
      onGroupSelect(selected);
      console.log('Selected group set to:', selected);
    }
  };

  const handleNext = () => {
    console.log('Current selectedGroup:', selectedGroup);
    if (!selectedGroup) {
      message.error("Please select a group first");
      return;
    }
    onNext();
  };

  const handlePopupScroll = (e) => {
    const { target } = e;
    if (
      !loading &&
      hasMore &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!selectedLevel?.id) {
    return (
      <Card className="text-center">
        <p className="text-gray-600">Please select a level first</p>
      </Card>
    );
  }

  if (loading && (!groups || groups.length === 0)) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error && (!groups || groups.length === 0)) {
    return (
      <Card className="text-center">
        <h2 className="text-red-500">Error loading groups</h2>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select or Create Group</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 w-full gap-4">
          <div className="space-y-2">
            <Label>Select Group</Label>
            <Select
              value={selectedGroup?.id?.toString() || undefined}
              onValueChange={handleGroupChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a group">
                  {selectedGroup
                    ? `${selectedGroup.name} (${selectedGroup.capacity} students)`
                    : "Select a group"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(groups || []).map((group) => (
                  <SelectItem
                    key={group.id}
                    value={group.id.toString()}
                    className="bg-white"
                  >
                    {group.name} ({group.capacity} students)
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
                <Button type="default" className="w-full bg-primary-light">
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
                    <Label>Group Name</Label>
                    <Input
                      placeholder="e.g., Group A, Section 1"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="default"
                      onClick={() => setIsGroupModalVisible(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="primary" onClick={handleCreateGroup}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleNext}
          className="mt-4 w-full bg-primary-light"
        >
          Next
        </Button>
      </CardContent>
    </Card>
  );
}
