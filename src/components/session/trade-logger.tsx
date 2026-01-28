"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addTrade } from "@/app/(app)/session/[id]/actions";
import type { Rule, EmotionTag } from "@/types/database";

const emotions: { value: EmotionTag; label: string; color: string }[] = [
  { value: "confident", label: "Confident", color: "bg-success/20 text-success" },
  { value: "calm", label: "Calm", color: "bg-primary/20 text-primary" },
  { value: "fomo", label: "FOMO", color: "bg-warning/20 text-warning" },
  { value: "revenge", label: "Revenge", color: "bg-destructive/20 text-destructive" },
  { value: "fearful", label: "Fearful", color: "bg-chart-5/20 text-chart-5" },
  { value: "frustrated", label: "Frustrated", color: "bg-chart-4/20 text-chart-4" },
];

interface TradeLoggerProps {
  sessionId: string;
  rules: Pick<Rule, "id" | "name" | "category">[];
  tradeCount: number;
  maxTrades?: number;
}

export function TradeLogger({ sessionId, rules, tradeCount, maxTrades }: TradeLoggerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<"win" | "loss" | "breakeven">("win");
  const [pnl, setPnl] = useState<string>("");
  const [pnlError, setPnlError] = useState<string>("");
  // Track which rules were followed (all rules start as followed)
  const [followedRuleIds, setFollowedRuleIds] = useState<string[]>(rules.map(r => r.id));
  const [emotionTag, setEmotionTag] = useState<EmotionTag>("calm");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setResult("win");
    setPnl("");
    setPnlError("");
    setFollowedRuleIds(rules.map(r => r.id));
    setEmotionTag("calm");
    setNotes("");
  };

  // Calculate broken rules (rules that are NOT in followedRuleIds)
  const brokenRuleIds = rules.filter(r => !followedRuleIds.includes(r.id)).map(r => r.id);
  const rulesFollowed = brokenRuleIds.length === 0;

  const handleSubmit = async () => {
    // For breakeven, P&L is always 0
    const pnlValue = result === "breakeven" ? 0 : parseFloat(pnl);

    // Validate P&L is provided (except for breakeven)
    if (result !== "breakeven" && (!pnl || pnl.trim() === "")) {
      setPnlError("P&L is required");
      return;
    }

    if (result !== "breakeven" && isNaN(pnlValue)) {
      setPnlError("Please enter a valid number");
      return;
    }

    setPnlError("");
    setLoading(true);

    const tradeResult = await addTrade(sessionId, {
      result,
      pnl: pnlValue,
      rules_followed: rulesFollowed,
      broken_rule_ids: brokenRuleIds,
      emotion_tag: emotionTag,
      notes: notes || null,
    });

    setLoading(false);

    if (tradeResult.error) {
      toast.error(tradeResult.error);
      return;
    }

    toast.success(`Trade #${tradeCount + 1} logged`);
    resetForm();
    setOpen(false);
  };

  const toggleRuleFollowed = (ruleId: string) => {
    setFollowedRuleIds((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const isAtMaxTrades = !!(maxTrades && tradeCount >= maxTrades);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isAtMaxTrades}
        className="w-full glow-primary transition-all duration-200 hover:scale-[1.02]"
        size="lg"
      >
        {isAtMaxTrades
          ? `Max Trades Reached (${maxTrades})`
          : `Log Trade #${tradeCount + 1}`}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-in">
          <DialogHeader>
            <DialogTitle className="text-xl">Log Trade #{tradeCount + 1}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Result */}
            <div className="space-y-2">
              <Label>Result <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                {(["win", "loss", "breakeven"] as const).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={result === r ? "default" : "outline"}
                    onClick={() => {
                      setResult(r);
                      // Auto-set P&L based on result
                      if (r === "breakeven") {
                        setPnl("0");
                        setPnlError("");
                      } else if (r === "loss" && pnl && parseFloat(pnl) > 0) {
                        // Make positive P&L negative when switching to loss
                        setPnl(String(-Math.abs(parseFloat(pnl))));
                      } else if (r === "win" && pnl && parseFloat(pnl) < 0) {
                        // Make negative P&L positive when switching to win
                        setPnl(String(Math.abs(parseFloat(pnl))));
                      }
                    }}
                    className={`flex-1 transition-all duration-200 ${
                      result === r
                        ? r === "win"
                          ? "bg-success hover:bg-success/90 text-success-foreground"
                          : r === "loss"
                          ? "bg-destructive hover:bg-destructive/90"
                          : ""
                        : "hover:scale-[1.02]"
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* P&L */}
            <div className="space-y-2">
              <Label htmlFor="pnl">
                P&L <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${result === "loss" ? "text-destructive" : "text-muted-foreground"}`}>
                  {result === "loss" ? "-$" : "$"}
                </span>
                <Input
                  id="pnl"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={result === "breakeven" ? "0" : "e.g., 150.00"}
                  value={result === "breakeven" ? "0" : (result === "loss" && pnl ? String(Math.abs(parseFloat(pnl) || 0)) : pnl)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (result === "loss") {
                      // Store as negative for losses
                      const numValue = parseFloat(value) || 0;
                      setPnl(String(-Math.abs(numValue)));
                    } else {
                      setPnl(value);
                    }
                    if (pnlError) setPnlError("");
                  }}
                  disabled={result === "breakeven"}
                  className={`${result === "loss" ? "pl-9" : "pl-7"} stat-number ${pnlError ? "border-destructive" : ""} ${result === "breakeven" ? "opacity-50" : ""}`}
                />
              </div>
              {result === "breakeven" && (
                <p className="text-sm text-muted-foreground">P&L is automatically set to $0 for break-even trades</p>
              )}
              {result === "loss" && (
                <p className="text-sm text-muted-foreground">Enter the amount lost (will be recorded as negative)</p>
              )}
              {pnlError && (
                <p className="text-sm text-destructive">{pnlError}</p>
              )}
            </div>

            {/* Rules Followed */}
            {rules.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rules Followed</Label>
                  {brokenRuleIds.length > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {brokenRuleIds.length} rule{brokenRuleIds.length > 1 ? "s" : ""} broken
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Uncheck any rules you did not follow on this trade
                </p>
                <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
                  {rules.map((rule) => {
                    const isFollowed = followedRuleIds.includes(rule.id);
                    return (
                      <div
                        key={rule.id}
                        className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                          !isFollowed ? "bg-destructive/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          id={`rule-${rule.id}`}
                          checked={isFollowed}
                          onCheckedChange={() => toggleRuleFollowed(rule.id)}
                        />
                        <Label
                          htmlFor={`rule-${rule.id}`}
                          className={`cursor-pointer text-sm flex-1 ${
                            !isFollowed ? "text-destructive line-through" : ""
                          }`}
                        >
                          {rule.name}
                        </Label>
                        {!isFollowed && (
                          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                            Broken
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emotion */}
            <div className="space-y-2">
              <Label>How were you feeling?</Label>
              <Select value={emotionTag} onValueChange={(v) => setEmotionTag(v as EmotionTag)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map((emotion) => (
                    <SelectItem key={emotion.value} value={emotion.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={emotion.color}>
                          {emotion.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What happened? What did you learn?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Logging..." : "Log Trade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
