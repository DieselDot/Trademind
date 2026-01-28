"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WellnessCheck } from "./wellness-check";
import { SessionPlan } from "./session-plan";
import { RulesReview } from "./rules-review";
import { createSession } from "@/app/(app)/session/actions";
import { toast } from "sonner";
import type { Rule, PreSessionData } from "@/types/database";

interface PreSessionFormProps {
  rules: Rule[];
}

type Step = "wellness" | "plan" | "rules";

const steps: { key: Step; label: string }[] = [
  { key: "wellness", label: "Wellness" },
  { key: "plan", label: "Plan" },
  { key: "rules", label: "Rules" },
];

export function PreSessionForm({ rules }: PreSessionFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("wellness");
  const [loading, setLoading] = useState(false);

  const [wellnessData, setWellnessData] = useState({
    sleepRating: 3,
    stressLevel: 3,
    focusRating: 3,
    wellnessNotes: "",
  });

  const [planData, setPlanData] = useState({
    plannedSetups: "",
    maxTrades: 3,
    maxLoss: 0,
  });

  const [planErrors, setPlanErrors] = useState<{
    plannedSetups?: string;
    maxTrades?: string;
    maxLoss?: string;
  }>({});

  const [rulesConfirmed, setRulesConfirmed] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const validatePlan = () => {
    const errors: typeof planErrors = {};

    if (!planData.plannedSetups.trim()) {
      errors.plannedSetups = "Please describe the setups you're looking for";
    }
    if (!planData.maxTrades || planData.maxTrades <= 0) {
      errors.maxTrades = "Please set a maximum number of trades";
    }
    if (!planData.maxLoss || planData.maxLoss <= 0) {
      errors.maxLoss = "Please set a maximum loss limit";
    }

    setPlanErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    switch (currentStep) {
      case "wellness":
        return (
          wellnessData.sleepRating > 0 &&
          wellnessData.stressLevel > 0 &&
          wellnessData.focusRating > 0
        );
      case "plan":
        return (
          planData.plannedSetups.trim() !== "" &&
          planData.maxTrades > 0 &&
          planData.maxLoss > 0
        );
      case "rules":
        return rules.length === 0 || rulesConfirmed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === "wellness") {
      setCurrentStep("plan");
    } else if (currentStep === "plan") {
      if (validatePlan()) {
        setCurrentStep("rules");
      }
    }
  };

  const handleBack = () => {
    if (currentStep === "plan") {
      setCurrentStep("wellness");
    } else if (currentStep === "rules") {
      setCurrentStep("plan");
    }
  };

  const handleStartSession = async () => {
    setLoading(true);

    const preSessionData: PreSessionData = {
      sleepRating: wellnessData.sleepRating,
      stressLevel: wellnessData.stressLevel,
      focusRating: wellnessData.focusRating,
      wellnessNotes: wellnessData.wellnessNotes || undefined,
      plannedSetups: planData.plannedSetups || undefined,
      maxTrades: planData.maxTrades,
      maxLoss: planData.maxLoss || undefined,
      rulesConfirmed: rulesConfirmed,
    };

    const result = await createSession(preSessionData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Session started! Good luck trading.");
    router.push(`/session/${result.data?.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => {
                if (index < currentStepIndex) {
                  setCurrentStep(step.key);
                }
              }}
              disabled={index > currentStepIndex}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                step.key === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStepIndex
                  ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                {index + 1}
              </span>
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-muted mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      {currentStep === "wellness" && (
        <WellnessCheck data={wellnessData} onChange={setWellnessData} />
      )}

      {currentStep === "plan" && (
        <SessionPlan data={planData} onChange={(data) => {
          setPlanData(data);
          // Clear errors when user types
          if (planErrors.plannedSetups && data.plannedSetups.trim()) {
            setPlanErrors(prev => ({ ...prev, plannedSetups: undefined }));
          }
          if (planErrors.maxTrades && data.maxTrades > 0) {
            setPlanErrors(prev => ({ ...prev, maxTrades: undefined }));
          }
          if (planErrors.maxLoss && data.maxLoss > 0) {
            setPlanErrors(prev => ({ ...prev, maxLoss: undefined }));
          }
        }} errors={planErrors} />
      )}

      {currentStep === "rules" && (
        <RulesReview
          rules={rules}
          confirmed={rulesConfirmed}
          onConfirmChange={setRulesConfirmed}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === "wellness"}
        >
          Back
        </Button>

        {currentStep === "rules" ? (
          <Button
            onClick={handleStartSession}
            disabled={!canProceed() || loading}
          >
            {loading ? "Starting..." : "Start Trading Session"}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
