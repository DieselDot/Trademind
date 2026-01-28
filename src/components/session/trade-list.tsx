"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteTrade } from "@/app/(app)/session/[id]/actions";
import type { Trade, Rule } from "@/types/database";

const emotionColors: Record<string, string> = {
  confident: "bg-success/20 text-success border-success/30",
  calm: "bg-primary/20 text-primary border-primary/30",
  fomo: "bg-warning/20 text-warning border-warning/30",
  revenge: "bg-destructive/20 text-destructive border-destructive/30",
  fearful: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  frustrated: "bg-chart-4/20 text-chart-4 border-chart-4/30",
};

const resultColors: Record<string, string> = {
  win: "bg-success/20 text-success border-success/30",
  loss: "bg-destructive/20 text-destructive border-destructive/30",
  breakeven: "bg-muted text-muted-foreground",
};

interface TradeListProps {
  trades: Trade[];
  sessionId: string;
  rules?: Pick<Rule, "id" | "name" | "category">[];
}

export function TradeList({ trades, sessionId, rules = [] }: TradeListProps) {
  // Create a map for quick rule name lookup
  const ruleMap = new Map(rules.map(r => [r.id, r.name]));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    const result = await deleteTrade(deleteId, sessionId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Trade deleted");
    }
    setDeleteId(null);
  };

  if (trades.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Trade Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No trades logged yet. Click the button above to log your first trade.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Trade Log ({trades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trades.map((trade) => {
              // Get broken rule names
              const brokenRuleNames = (trade.broken_rule_ids || [])
                .map(id => ruleMap.get(id))
                .filter(Boolean);

              return (
                <div
                  key={trade.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    !trade.rules_followed
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="stat-number text-lg font-bold text-muted-foreground">
                        #{trade.trade_number}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`badge-smooth ${resultColors[trade.result]}`}>
                            {trade.result.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={`badge-smooth ${emotionColors[trade.emotion_tag]}`}>
                            {trade.emotion_tag}
                          </Badge>
                        </div>
                        {/* Show broken rules */}
                        {!trade.rules_followed && brokenRuleNames.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-destructive">Rules broken:</p>
                            <div className="flex flex-wrap gap-1">
                              {brokenRuleNames.map((name, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                                >
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {!trade.rules_followed && brokenRuleNames.length === 0 && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            Rules Broken
                          </Badge>
                        )}
                        {trade.notes && (
                          <p className="text-xs text-muted-foreground">{trade.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`stat-number font-medium ${
                          trade.pnl !== null && trade.pnl > 0
                            ? "text-success"
                            : trade.pnl !== null && trade.pnl < 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {trade.pnl !== null ? (
                          <>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </>
                        ) : (
                          "--"
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(trade.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
