import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, DatePicker } from "antd";
import moment from "moment";
import { translations } from "../utils/translations";

import { message } from "antd";
import apiCall from "@/components/utils/apiCall";

const defaultTrimesters = [
  {
    name: "Trimester 1",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    duration: 12,
  },
  {
    name: "Trimester 2",
    startDate: "2026-01-07",
    endDate: "2026-04-15",
    duration: 12,
  },
  {
    name: "Trimester 3",
    startDate: "2026-04-20",
    endDate: "2026-07-31",
    duration: 12,
  },
];


const TrimesterForm = ({
  t,
  token,
  selectedLevelId,
  trimesterData,
  setTrimesterData,
  handleNext,
}) => {
  const [trimesterOption, setTrimesterOption] = useState("");
  const [trimesterName, setTrimesterName] = useState("");
  const [dateRange, setDateRange] = useState(null);

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

  const validateAndNext = async () => {
    if (!trimesterName.trim()) {
      message.error(t.errors.trimesterName);
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.error(t.errors.dateRange);
      return;
    }

    const trimesterPayload = {
      name: trimesterName,
      level_id: Number(selectedLevelId),
      start_date: dateRange[0],
      duration: moment(dateRange[1]).diff(moment(dateRange[0]), "weeks") + 1,
    };

    try {
      const data = await apiCall("post", "/api/semesters/", trimesterPayload, {
        token,
      });
      setTrimesterData({
        id: data.id,
        name: trimesterName,
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
      message.success(t.success.createTrimester);
      handleNext();
    } catch (error) {
      console.error("Error creating trimester:", error);
      message.error(t.errors.createTrimesterFailed);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.steps.createTrimester}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="trimesterOption">{t.selectTrimester}</Label>
          <Select value={trimesterOption} onValueChange={handleTrimesterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t.selectTrimester} />
            </SelectTrigger>
            <SelectContent>
              {defaultTrimesters.map((trimester) => (
                <SelectItem key={trimester.name} value={trimester.name}>
                  {trimester.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {trimesterOption === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="trimesterName">{t.trimesterName}</Label>
            <Input
              id="trimesterName"
              placeholder="e.g., Automne 2025, Trimestre 1"
              value={trimesterName}
              onChange={(e) => setTrimesterName(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>{t.dateRange}</Label>
          <DatePicker.RangePicker
            className="w-full"
            onChange={handleDateRangeChange}
            disabledDate={(current) =>
              current && current < moment().startOf("day")
            }
            format="YYYY-MM-DD"
            value={dateRange ? [moment(dateRange[0]), moment(dateRange[1])] : null}
            disabled={trimesterOption !== "custom"}
          />
        </div>
        <Button onClick={validateAndNext}>{t.next}</Button>
      </CardContent>
    </Card>
  );
};

export default TrimesterForm;