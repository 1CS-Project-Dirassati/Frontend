import { useState } from "react";
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
import { translations } from "../utils/translations";

import { message } from "antd";
import apiCall from "@/components/utils/apiCall";



const GroupSelector = ({
  t,
  token,
  selectedLevelId,
  groups,
  setGroups,
  selectedGroupId,
  setSelectedGroupId,
  handleNext,
}) => {
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      message.error(t.errors.createGroup);
      return;
    }
    try {
      const groupPayload = {
        name: groupName,
        level_id: Number(selectedLevelId),
      };
      const data = await apiCall("post", `/api/groups/?level_id=${selectedLevelId}`, null, {
        token,
      });
      setGroups([...groups, data]);
      setSelectedGroupId(data.id);
      message.success(t.success.createGroup);
      setIsGroupModalVisible(false);
      setGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
      message.error(t.errors.createGroup);
    }
  };

  const validateAndNext = () => {
    if (!selectedGroupId) {
      message.error(t.errors.selectGroup);
      return;
    }
    handleNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.steps.selectGroup}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.selectGroup}</Label>
            <Select
              value={selectedGroupId ? String(selectedGroupId) : ""}
              onValueChange={(value) => setSelectedGroupId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectGroup} />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
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
                  {t.createGroup}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.createGroup}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">{t.groupName}</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Groupe A, Section 1"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsGroupModalVisible(false)}
                    >
                      {t.cancel}
                    </Button>
                    <Button onClick={handleCreateGroup}>{t.create}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Button onClick={validateAndNext} className="mt-4">
          {t.next}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GroupSelector;
