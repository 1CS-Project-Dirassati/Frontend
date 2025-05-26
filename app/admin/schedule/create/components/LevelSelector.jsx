import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react"; // Add useCallback
import { debounce } from "lodash";
import { translations } from "../utils/translations";
import { Button, message } from "antd";

const LevelSelector = ({
  t,
  selectedLevelId,
  setSelectedLevelId,
  levels,
  handleNext,
}) => {
  // Memoize the debounced function to prevent recreation
  const debouncedSetSelectedLevelId = useCallback(
    debounce((value) => {
      if (value !== String(selectedLevelId)) {
        setSelectedLevelId(Number(value) || null); // Handle empty string
      }
    }, 300),
    [selectedLevelId, setSelectedLevelId] // Include dependencies
  );

  const validateAndNext = () => {
    if (!selectedLevelId) {
      message.error(t.errors.selectLevel);
      return;
    }
    handleNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.steps.selectLevel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="level">{t.selectLevel}</Label>
          <Select
            value={selectedLevelId ? String(selectedLevelId) : ""}
            onValueChange={debouncedSetSelectedLevelId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.selectLevel} />
            </SelectTrigger>
            <SelectContent>
              {levels.length > 0 ? (
                levels.map((level) => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Aucun niveau disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={validateAndNext} className="mt-4">
            {t.next}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelSelector;
