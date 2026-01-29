"use client";

import { useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { JournalForm } from "./journal-form";
import { deleteJournalEntry, type DayStats } from "@/app/(app)/journal/actions";
import type { JournalEntry } from "@/types/database";

interface JournalListProps {
  entries: JournalEntry[];
  stats: Record<string, DayStats>;
}

export function JournalList({ entries, stats }: JournalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteJournalEntry(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Entry deleted");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const dayStats = stats[entry.date];

        return (
          <Collapsible
            key={entry.id}
            open={isExpanded}
            onOpenChange={(open) => setExpandedId(open ? entry.id : null)}
          >
            <div className="border rounded-lg bg-card overflow-hidden">
              {/* Collapsed header - always visible */}
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(entry.date)}
                    </span>
                    <span className="font-medium truncate">{entry.title}</span>
                    {entry.image_url && (
                      <span className="text-xs text-muted-foreground">📷</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {dayStats && (
                      <span className={`text-xs font-medium ${dayStats.totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {dayStats.totalPnl >= 0 ? "+" : ""}{dayStats.totalPnl.toFixed(2)}
                      </span>
                    )}
                    <svg
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </CollapsibleTrigger>

              {/* Expanded content */}
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-2 border-t space-y-3">
                  {/* Trading stats for this day */}
                  {dayStats && (
                    <div className="flex gap-4 text-xs py-2 px-3 bg-muted/50 rounded-md">
                      <span>
                        <span className="text-muted-foreground">P&L:</span>{" "}
                        <span className={dayStats.totalPnl >= 0 ? "text-green-500" : "text-red-500"}>
                          {dayStats.totalPnl >= 0 ? "+" : ""}{dayStats.totalPnl.toFixed(2)}
                        </span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Trades:</span> {dayStats.tradeCount}
                      </span>
                      <span>
                        <span className="text-muted-foreground">W/L:</span>{" "}
                        <span className="text-green-500">{dayStats.wins}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-500">{dayStats.losses}</span>
                      </span>
                      {dayStats.tradeCount > 0 && (
                        <span>
                          <span className="text-muted-foreground">Win%:</span>{" "}
                          {((dayStats.wins / dayStats.tradeCount) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {entry.image_url && (
                    <img
                      src={entry.image_url}
                      alt="Journal attachment"
                      loading="lazy"
                      className="w-full max-h-64 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(entry.image_url!, "_blank")}
                    />
                  )}

                  <div className="flex gap-2 pt-2">
                    <JournalForm entry={entry}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </JournalForm>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(entry.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
