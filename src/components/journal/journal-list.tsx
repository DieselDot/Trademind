"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { toast } from "sonner";
import { JournalForm } from "./journal-form";
import { deleteJournalEntry } from "@/app/(app)/journal/actions";
import type { JournalEntry } from "@/types/database";

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const contentPreview = entry.content.length > 200
          ? entry.content.substring(0, 200) + "..."
          : entry.content;

        return (
          <Card key={entry.id} className="card-hover overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.date)}
                  </p>
                  <h3 className="text-lg font-semibold mt-1">{entry.title}</h3>
                </div>
                <div className="flex gap-2">
                  <JournalForm entry={entry}>
                    <Button variant="ghost" size="sm">
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
                          This action cannot be undone. This will permanently delete your journal entry.
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Content */}
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {isExpanded ? entry.content : contentPreview}
                </div>

                {entry.content.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-0 h-auto text-primary"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </Button>
                )}

                {/* Image */}
                {entry.image_url && (
                  <div className="mt-4">
                    <img
                      src={entry.image_url}
                      alt="Journal attachment"
                      className="w-full max-h-96 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(entry.image_url!, "_blank")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
