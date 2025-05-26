"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useSelector } from "react-redux";
import Steps from "./Steps";
import LevelSelector from "./components/LevelSelector";
import TrimesterForm from "./components/TrimesterForm";
import ModuleSelector from "./components/ModuleSelector";
import GroupSelector from "./components/GroupSelector";
import ScheduleBuilder from "./components/ScheduleBuilder";
import { translations } from "./utils/translations";
import { fetchInitialData } from "./utils/apiUtils";

const stepsConfig = [
  { title: "selectLevel", Component: LevelSelector },
  { title: "createTrimester", Component: TrimesterForm },
  { title: "assignModules", Component: ModuleSelector },
  { title: "selectGroup", Component: GroupSelector },
  { title: "buildSchedule", Component: ScheduleBuilder },
];

const CreateAdminSchedulePage = () => {
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);
  const t = translations.fr;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [trimesterData, setTrimesterData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (token) {
      fetchInitialData(token, t)
        .then(({ levels, modules, teachers, groups }) => {
          setLevels(levels || []);
          setAvailableModules(modules || []);
          setTeachers(teachers || []);
          setGroups(groups || []);
          setIsLoading(false);
        })
        .catch(() => {
          setLevels([]);
          setAvailableModules([]);
          setTeachers([]);
          setGroups([]);
          setIsLoading(false);
        });
    }
  }, [token, t]);

  // Reset dependent state on level change
  useEffect(() => {
    if (!selectedLevelId) return;

    const levelModules = availableModules.filter(
      (module) => module.level_id === selectedLevelId
    );
    const levelGroups = groups.filter(
      (group) => group.level_id === selectedLevelId
    );

    // Only update if necessary to prevent loops
    if (
      JSON.stringify(levelModules) !== JSON.stringify(availableModules) ||
      JSON.stringify(levelGroups) !== JSON.stringify(groups)
    ) {
      setAvailableModules(levelModules);
      setGroups(levelGroups);
      setSelectedModules([]);
      setSelectedGroupId(null);
      setWeeklySchedule({});
      setAvailableTimeSlots({});
    }
  }, [selectedLevelId]); // Remove availableModules and groups from dependencies

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => setCurrentStep((prev) => prev - 1), []);

  const handleSaveSchedule = useCallback(async () => {
    // Implemented in ScheduleBuilder
  }, []);

  const CurrentStepComponent = stepsConfig[currentStep].Component;

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">{t.title}</h1>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/schedule")}
            >
              {t.backToSchedules}
            </Button>
          </div>
          <Steps current={currentStep} items={stepsConfig} t={t} />
        </CardContent>
      </Card>

      <div className="mb-6">
        <CurrentStepComponent
          token={token}
          t={t}
          selectedLevelId={selectedLevelId}
          setSelectedLevelId={setSelectedLevelId}
          trimesterData={trimesterData}
          setTrimesterData={setTrimesterData}
          levels={levels}
          availableModules={availableModules}
          selectedModules={selectedModules}
          setSelectedModules={setSelectedModules}
          groups={groups}
          setGroups={setGroups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          weeklySchedule={weeklySchedule}
          setWeeklySchedule={setWeeklySchedule}
          teachers={teachers}
          rooms={rooms}
          availableTimeSlots={availableTimeSlots}
          setAvailableTimeSlots={setAvailableTimeSlots}
          isLoading={isLoading}
          handleNext={handleNext}
          handleSaveSchedule={handleSaveSchedule}
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              {t.previous}
            </Button>
            {currentStep < stepsConfig.length - 1 ? (
              <Button onClick={handleNext}>{t.next}</Button>
            ) : (
              <Button
                onClick={handleSaveSchedule}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {t.saveSchedule}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdminSchedulePage;
