"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SessionPlanData {
  plannedSetups: string;
  maxTrades: number;
  maxLoss: number;
}

interface SessionPlanProps {
  data: SessionPlanData;
  onChange: (data: SessionPlanData) => void;
  errors?: {
    plannedSetups?: string;
    maxTrades?: string;
    maxLoss?: string;
  };
}

export function SessionPlan({ data, onChange, errors = {} }: SessionPlanProps) {
  const updateField = <K extends keyof SessionPlanData>(
    field: K,
    value: SessionPlanData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Session Plan</CardTitle>
        <CardDescription>
          Set your intentions and limits for this trading session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="planned-setups">
            What setups are you looking for today? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="planned-setups"
            placeholder="e.g., Breakouts on high volume, pullbacks to support levels, gap fills..."
            value={data.plannedSetups}
            onChange={(e) => updateField("plannedSetups", e.target.value)}
            className={`resize-none ${errors.plannedSetups ? "border-destructive" : ""}`}
            rows={3}
          />
          {errors.plannedSetups && (
            <p className="text-sm text-destructive">{errors.plannedSetups}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="max-trades">
              Maximum Trades <span className="text-destructive">*</span>
            </Label>
            <Input
              id="max-trades"
              type="number"
              min={1}
              max={100}
              placeholder="e.g., 3"
              value={data.maxTrades || ""}
              onChange={(e) =>
                updateField("maxTrades", parseInt(e.target.value) || 0)
              }
              className={`stat-number ${errors.maxTrades ? "border-destructive" : ""}`}
            />
            {errors.maxTrades ? (
              <p className="text-sm text-destructive">{errors.maxTrades}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                How many trades will you allow yourself today?
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-loss">
              Maximum Loss ($) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="max-loss"
                type="number"
                min={1}
                step={0.01}
                placeholder="e.g., 100"
                value={data.maxLoss || ""}
                onChange={(e) =>
                  updateField("maxLoss", parseFloat(e.target.value) || 0)
                }
                className={`pl-7 stat-number ${errors.maxLoss ? "border-destructive" : ""}`}
              />
            </div>
            {errors.maxLoss ? (
              <p className="text-sm text-destructive">{errors.maxLoss}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Stop trading if you lose this amount
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
