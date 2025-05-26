import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { translations } from "../utils/translations";
import { Button, message } from "antd";



const ModuleSelector = ({
  t,
  availableModules,
  selectedModules,
  setSelectedModules,
  trimesterData,
  handleNext,
}) => {
  const validateAndNext = () => {
    if (selectedModules.length === 0) {
      message.error(t.errors.selectModules);
      return;
    }
    handleNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t.steps.assignModules} pour {trimesterData?.name || "Trimestre"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>{t.selectModules}</Label>
          <div className="space-y-2">
            {availableModules.map((module) => (
              <div key={module.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={String(module.id)}
                  checked={selectedModules.includes(module.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModules([...selectedModules, module.id]);
                    } else {
                      setSelectedModules(
                        selectedModules.filter((id) => id !== module.id)
                      );
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor={String(module.id)} className="text-sm">
                  {module.name}
                </label>
              </div>
            ))}
          </div>
          <Button onClick={validateAndNext} className="mt-4">
            {t.next}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleSelector;
