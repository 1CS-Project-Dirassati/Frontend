"use client";

import { useState, useEffect } from "react";
import { Select, Spin, message, Button, DatePicker } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import moment from "moment";

const { Option } = Select;

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

export default function TrimesterForm({ selectedLevel, onTrimesterSelect }) {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trimesterOption, setTrimesterOption] = useState("");
  const [trimesterName, setTrimesterName] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (!token || !selectedLevel?.id) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `/api/semesters/?level_id=${selectedLevel.id}&page=${currentPage}`,
          null,
          { token }
        );

        if (response.status && Array.isArray(response.semesters)) {
          if (currentPage === 1) {
            setSemesters(response.semesters);
          } else {
            setSemesters(prev => [...prev, ...response.semesters]);
          }
          setHasMore(response.has_next);
        } else {
          setError("Failed to fetch semesters");
          message.error("Failed to fetch semesters");
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
        setError(error.message);
        message.error("Error loading semesters");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, [token, selectedLevel, currentPage]);

  const handleTrimesterChange = (value) => {
    setTrimesterOption(value);
    if (value === "custom") {
      setTrimesterName("");
      setDateRange(null);
    } else {
      const selected = semesters.find(s => s.id === value);
      if (selected) {
        onTrimesterSelect(selected);
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

  const handleCreateTrimester = async () => {
    if (!trimesterName.trim()) {
      message.error("Please enter a semester name");
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.error("Please select a date range");
      return;
    }

    try {
      const semesterPayload = {
        name: trimesterName,
        level_id: selectedLevel.id,
        start_date: dateRange[0],
        duration: moment(dateRange[1]).diff(moment(dateRange[0]), "weeks") + 1,
      };

      const response = await apiCall(
        'POST',
        '/api/semesters/',
        semesterPayload,
        { token }
      );

      if (response.status) {
        message.success("Semester created successfully");
        onTrimesterSelect(response.semester);
      } else {
        message.error("Failed to create semester");
      }
    } catch (error) {
      console.error("Error creating semester:", error);
      message.error("Error creating semester");
    }
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

  if (loading && semesters.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error && semesters.length === 0) {
    return (
      <Card className="text-center">
        <h2 className="text-red-500">Error loading semesters</h2>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select or Create Semester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Existing Semester</Label>
          <Select
            className="w-full"
            placeholder="Select a semester"
            onChange={handleTrimesterChange}
            value={trimesterOption}
            loading={loading}
            onPopupScroll={handlePopupScroll}
            showSearch
            optionFilterProp="children"
          >
            {semesters.map(semester => (
              <Option key={semester.id} value={semester.id}>
                {semester.name} ({moment(semester.start_date).format('YYYY-MM-DD')} - {moment(semester.start_date).add(semester.duration - 1, 'weeks').format('YYYY-MM-DD')})
              </Option>
            ))}
            <Option value="custom">Create New Semester</Option>
          </Select>
        </div>

        {trimesterOption === "custom" && (
          <>
            <div className="space-y-2">
              <Label>Semester Name</Label>
              <Input
                placeholder="e.g., Fall 2024, Semester 1"
                value={trimesterName}
                onChange={(e) => setTrimesterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePicker.RangePicker
                className="w-full"
                onChange={handleDateRangeChange}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
                format="YYYY-MM-DD"
                value={dateRange ? [moment(dateRange[0]), moment(dateRange[1])] : null}
              />
            </div>
            <Button type="primary" onClick={handleCreateTrimester}>
              Create Semester
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}