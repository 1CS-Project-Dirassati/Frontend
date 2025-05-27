"use client";

import { useState, useEffect } from "react";
import { Card, Select, Spin, message } from "antd";
import { useSelector } from "react-redux";
import apiCall from "@/components/utils/apiCall";

const { Option } = Select;

export default function LevelSelector({ onLevelSelect }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchLevels = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await apiCall(
          'GET',
          `/api/levels/?page=${currentPage}`,
          null,
          { token }
        );

        if (response.status && Array.isArray(response.levels)) {
          if (currentPage === 1) {
            setLevels(response.levels);
          } else {
            setLevels(prev => [...prev, ...response.levels]);
          }
          setHasMore(response.has_next);
        } else {
          setError("Failed to fetch levels");
          message.error("Failed to fetch levels");
        }
      } catch (error) {
        console.error("Error fetching levels:", error);
        setError(error.message);
        message.error("Error loading levels");
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [token, currentPage]);

  const handleLevelChange = (levelId) => {
    const selectedLevel = levels.find(level => level.id === levelId);
    onLevelSelect(selectedLevel);
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

  if (loading && levels.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error && levels.length === 0) {
    return (
      <Card className="text-center">
        <h2 className="text-red-500">Error loading levels</h2>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card title="Select Level" className="w-full max-w-md mx-auto">
      <div className="p-4">
        <Select
          placeholder="Select a level"
          className="w-full"
          onChange={handleLevelChange}
          loading={loading}
          onPopupScroll={handlePopupScroll}
          showSearch
          optionFilterProp="children"
        >
          {levels.map(level => (
            <Option key={level.id} value={level.id}>
              {level.name}
              {level.description && (
                <span className="text-gray-500 text-sm ml-2">
                  ({level.description})
                </span>
              )}
            </Option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
