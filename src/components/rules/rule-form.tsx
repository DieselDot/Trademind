"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ruleSchema, type RuleInput } from "@/lib/validations";
import { createRule, updateRule } from "@/app/(app)/rules/actions";
import type { Rule } from "@/types/database";

const categories = [
  { value: "risk", label: "Risk Management" },
  { value: "entry", label: "Entry Rules" },
  { value: "exit", label: "Exit Rules" },
  { value: "timing", label: "Timing" },
  { value: "mindset", label: "Mindset" },
] as const;

interface RuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: Rule | null;
}

export function RuleForm({ open, onOpenChange, rule }: RuleFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!rule;

  const form = useForm<RuleInput>({
    resolver: zodResolver(ruleSchema) as any,
    defaultValues: {
      name: rule?.name || "",
      description: rule?.description || "",
      category: rule?.category || undefined,
      is_active: rule?.is_active ?? true,
    },
  });

  // Reset form when rule changes
  useState(() => {
    if (open) {
      form.reset({
        name: rule?.name || "",
        description: rule?.description || "",
        category: rule?.category || undefined,
        is_active: rule?.is_active ?? true,
      });
    }
  });

  const onSubmit = async (data: RuleInput) => {
    setLoading(true);

    try {
      if (isEditing && rule) {
        const result = await updateRule(rule.id, data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Rule updated successfully");
      } else {
        const result = await createRule(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Rule created successfully");
      }
      form.reset();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Rule" : "Create New Rule"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Max 3 trades per day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this rule is important..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
