"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./star-rating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sleepOptions = [
  { value: 4, label: "Less than 5 hours" },
  { value: 5, label: "5-6 hours" },
  { value: 6, label: "6-7 hours" },
  { value: 7, label: "7-8 hours" },
  { value: 8, label: "8-9 hours (optimal)" },
  { value: 9, label: "More than 9 hours" },
];

interface WellnessData {
  sleepRating: number;
  stressLevel: number;
  focusRating: number;
  wellnessNotes: string;
}

interface WellnessCheckProps {
  data: WellnessData;
  onChange: (data: WellnessData) => void;
}

export function WellnessCheck({ data, onChange }: WellnessCheckProps) {
  const updateField = <K extends keyof WellnessData>(
    field: K,
    value: WellnessData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Check-in</CardTitle>
        <CardDescription>
          How are you feeling before this trading session?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Hours of Sleep</Label>
          <p className="text-sm text-muted-foreground">
            How many hours did you sleep last night?
          </p>
          <Select
            value={String(data.sleepRating)}
            onValueChange={(v) => updateField("sleepRating", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hours of sleep" />
            </SelectTrigger>
            <SelectContent>
              {sleepOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <StarRating
          label="Stress Level"
          description="1 = Very stressed, 5 = Very calm"
          value={data.stressLevel}
          onChange={(v) => updateField("stressLevel", v)}
        />

        <StarRating
          label="Focus & Energy"
          description="How focused and energized do you feel?"
          value={data.focusRating}
          onChange={(v) => updateField("focusRating", v)}
        />

        <div className="space-y-2">
          <Label htmlFor="wellness-notes">Notes (Optional)</Label>
          <Textarea
            id="wellness-notes"
            placeholder="Anything affecting your mindset today? (e.g., upcoming meeting, family event, feeling great...)"
            value={data.wellnessNotes}
            onChange={(e) => updateField("wellnessNotes", e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
