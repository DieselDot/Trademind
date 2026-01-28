"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteRule, toggleRuleActive } from "@/app/(app)/rules/actions";
import type { Rule } from "@/types/database";

const categoryColors: Record<string, string> = {
  risk: "bg-destructive/10 text-destructive border-destructive/20",
  entry: "bg-success/10 text-success border-success/20",
  exit: "bg-primary/10 text-primary border-primary/20",
  timing: "bg-warning/10 text-warning border-warning/20",
  mindset: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const categoryLabels: Record<string, string> = {
  risk: "Risk Management",
  entry: "Entry",
  exit: "Exit",
  timing: "Timing",
  mindset: "Mindset",
};

interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
}

export function RuleCard({ rule, onEdit }: RuleCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    const result = await toggleRuleActive(rule.id, !rule.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(rule.is_active ? "Rule disabled" : "Rule enabled");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteRule(rule.id);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Rule deleted");
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <Card className={`card-hover ${!rule.is_active ? "opacity-60" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={rule.is_active}
                onCheckedChange={handleToggleActive}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-base font-medium">{rule.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs badge-smooth ${categoryColors[rule.category]}`}
                >
                  {categoryLabels[rule.category]}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
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
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(rule)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {rule.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{rule.name}&quot;? This action cannot
              be undone.
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
