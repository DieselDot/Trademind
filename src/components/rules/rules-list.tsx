"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RuleCard } from "./rule-card";
import { RuleForm } from "./rule-form";
import type { Rule } from "@/types/database";

interface RulesListProps {
  initialRules: Rule[];
}

export function RulesList({ initialRules }: RulesListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingRule(null);
    }
  };

  const activeRules = initialRules.filter((r) => r.is_active);
  const inactiveRules = initialRules.filter((r) => !r.is_active);

  return (
    <>
      <div className="flex items-center justify-between fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Rules</h1>
          <p className="text-muted-foreground mt-2">
            Define and manage your personal trading rules
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="transition-all duration-200 hover:scale-105">Add Rule</Button>
      </div>

      {initialRules.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No rules yet</h3>
          <p className="text-muted-foreground mt-2">
            Create your first trading rule to start tracking your discipline.
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            Create Your First Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeRules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Active Rules ({activeRules.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeRules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}

          {inactiveRules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Inactive Rules ({inactiveRules.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {inactiveRules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RuleForm
        open={formOpen}
        onOpenChange={handleOpenChange}
        rule={editingRule}
      />
    </>
  );
}
