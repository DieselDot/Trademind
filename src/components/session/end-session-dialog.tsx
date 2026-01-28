"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StarRating } from "./star-rating";
import { endSession } from "@/app/(app)/session/[id]/actions";
import { toast } from "sonner";
import type { PostSessionData } from "@/types/database";

interface EndSessionDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EndSessionDialog({
  sessionId,
  open,
  onOpenChange,
}: EndSessionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [postSession, setPostSession] = useState<PostSessionData>({
    planFollowedRating: 3,
    emotionalControlRating: 3,
    whatWentWell: "",
    whatToImprove: "",
    tomorrowFocus: "",
  });

  const [errors, setErrors] = useState<{
    whatWentWell?: string;
    whatToImprove?: string;
    tomorrowFocus?: string;
  }>({});

  const updateField = <K extends keyof PostSessionData>(
    field: K,
    value: PostSessionData[K]
  ) => {
    setPostSession((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!postSession.whatWentWell?.trim()) {
      newErrors.whatWentWell = "Please share what went well";
    }
    if (!postSession.whatToImprove?.trim()) {
      newErrors.whatToImprove = "Please share what you could improve";
    }
    if (!postSession.tomorrowFocus?.trim()) {
      newErrors.tomorrowFocus = "Please set a focus for tomorrow";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canSubmit = () => {
    return (
      postSession.whatWentWell?.trim() !== "" &&
      postSession.whatToImprove?.trim() !== "" &&
      postSession.tomorrowFocus?.trim() !== ""
    );
  };

  const handleEndSession = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    const result = await endSession(sessionId, postSession);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(
      `Session ended! Discipline Score: ${result.data?.discipline_score}`
    );
    onOpenChange(false);
    router.push(`/session/${sessionId}/review`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-in">
        <DialogHeader>
          <DialogTitle className="text-xl">End Trading Session</DialogTitle>
          <DialogDescription>
            Reflect on your session before closing it out
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            label="Did you follow your trading plan?"
            description="1 = Not at all, 5 = Perfectly"
            value={postSession.planFollowedRating || 3}
            onChange={(v) => updateField("planFollowedRating", v)}
            required
          />

          <StarRating
            label="How was your emotional control?"
            description="1 = Very emotional, 5 = Completely calm"
            value={postSession.emotionalControlRating || 3}
            onChange={(v) => updateField("emotionalControlRating", v)}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="went-well">
              What went well today? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="went-well"
              placeholder="e.g., Stuck to my stop losses, waited for confirmation..."
              value={postSession.whatWentWell || ""}
              onChange={(e) => updateField("whatWentWell", e.target.value)}
              className={`resize-none ${errors.whatWentWell ? "border-destructive" : ""}`}
              rows={2}
            />
            {errors.whatWentWell && (
              <p className="text-sm text-destructive">{errors.whatWentWell}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="improve">
              What could you improve? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="improve"
              placeholder="e.g., Took too many trades, entered too early..."
              value={postSession.whatToImprove || ""}
              onChange={(e) => updateField("whatToImprove", e.target.value)}
              className={`resize-none ${errors.whatToImprove ? "border-destructive" : ""}`}
              rows={2}
            />
            {errors.whatToImprove && (
              <p className="text-sm text-destructive">{errors.whatToImprove}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">
              One thing to focus on tomorrow <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="focus"
              placeholder="e.g., Wait for the setup to come to me"
              value={postSession.tomorrowFocus || ""}
              onChange={(e) => updateField("tomorrowFocus", e.target.value)}
              className={`resize-none ${errors.tomorrowFocus ? "border-destructive" : ""}`}
              rows={2}
            />
            {errors.tomorrowFocus && (
              <p className="text-sm text-destructive">{errors.tomorrowFocus}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEndSession}
            disabled={loading || !canSubmit()}
            className="transition-all duration-200"
          >
            {loading ? "Ending Session..." : "End Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
