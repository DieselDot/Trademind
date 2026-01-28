"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Rule } from "@/types/database";

const categoryColors: Record<string, string> = {
  risk: "bg-red-500/20 text-red-400 border-red-500/30",
  entry: "bg-green-500/20 text-green-400 border-green-500/30",
  exit: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  timing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  mindset: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const categoryLabels: Record<string, string> = {
  risk: "Risk",
  entry: "Entry",
  exit: "Exit",
  timing: "Timing",
  mindset: "Mindset",
};

interface RulesReviewProps {
  rules: Rule[];
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export function RulesReview({ rules, confirmed, onConfirmChange }: RulesReviewProps) {
  // Group rules by category
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const categoryOrder = ["risk", "entry", "exit", "timing", "mindset"];
  const sortedCategories = categoryOrder.filter((cat) => groupedRules[cat]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rules Review</CardTitle>
        <CardDescription>
          Review your trading rules before starting the session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rules.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You haven&apos;t created any rules yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You can still start a session, but consider adding rules to track your discipline.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <Badge
                    variant="outline"
                    className={`mb-2 ${categoryColors[category]}`}
                  >
                    {categoryLabels[category]}
                  </Badge>
                  <ul className="space-y-2 ml-1">
                    {groupedRules[category].map((rule) => (
                      <li
                        key={rule.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <div>
                          <span className="font-medium">{rule.name}</span>
                          {rule.description && (
                            <p className="text-muted-foreground text-xs mt-0.5">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="confirm-rules"
                  checked={confirmed}
                  onCheckedChange={(checked) => onConfirmChange(checked === true)}
                />
                <Label
                  htmlFor="confirm-rules"
                  className="text-sm font-medium cursor-pointer"
                >
                  I have reviewed my rules and commit to following them today
                </Label>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
