
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LevelSelector from "./components/LevelSelector";
import TrimesterForm from "./components/TrimesterForm";
import GroupSelector from "./components/GroupSelector";
import ScheduleBuilder from "./components/ScheduleBuilder";
import { translations } from "./utils/translations";
import { useRouter } from "next/navigation";

const steps = [
  { id: "level", title: "Select Level" },
  { id: "trimester", title: "Select Trimester" },
  { id: "group", title: "Select Group" },
  { id: "schedule", title: "Build Schedule" },
];

export default function CreateSchedule() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTrimester, setSelectedTrimester] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    router.push("/admin/schedule");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LevelSelector
            onLevelSelect={(level) => {
              setSelectedLevel(level);
              handleNext();
            }}
          />
        );
      case 1:
        return (
          <TrimesterForm
            selectedLevel={selectedLevel}
            onTrimesterSelect={(trimester) => {
              setSelectedTrimester(trimester);
              handleNext();
            }}
          />
        );
      case 2:
        return (
          <GroupSelector
            selectedLevel={selectedLevel}
            onGroupSelect={(group) => {
              setSelectedGroup(group);
              handleNext();
            }}
          />
        );
      case 3:
        return (
          <ScheduleBuilder
            selectedGroup={selectedGroup}
            selectedTrimester={selectedTrimester}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Schedule</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index !== steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {index + 1}
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">{renderStep()}</Card>
    </div>
  );
}
