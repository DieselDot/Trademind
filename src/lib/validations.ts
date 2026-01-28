import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Rule validations
export const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(100, "Rule name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  category: z.enum(["risk", "entry", "exit", "timing", "mindset"], {
    message: "Please select a category",
  }),
  is_active: z.boolean().default(true),
});

// Pre-session validations
export const preSessionSchema = z.object({
  sleepRating: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  focusRating: z.number().min(1).max(5),
  wellnessNotes: z.string().max(500).optional(),
  plannedSetups: z.string().max(1000).optional(),
  maxTrades: z.number().min(1).max(100),
  maxLoss: z.number().min(0).optional(),
  rulesConfirmed: z.boolean(),
});

// Trade validations
export const tradeSchema = z.object({
  result: z.enum(["win", "loss", "breakeven"]),
  pnl: z.number().optional(),
  rules_followed: z.boolean(),
  broken_rule_ids: z.array(z.string()).optional(),
  emotion_tag: z.enum(["confident", "calm", "fomo", "revenge", "fearful", "frustrated"]),
  notes: z.string().max(500).optional(),
});

// Post-session validations
export const postSessionSchema = z.object({
  planFollowedRating: z.number().min(1).max(5),
  emotionalControlRating: z.number().min(1).max(5),
  whatWentWell: z.string().max(1000).optional(),
  whatToImprove: z.string().max(1000).optional(),
  tomorrowFocus: z.string().max(500).optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RuleInput = z.infer<typeof ruleSchema>;
export type PreSessionInput = z.infer<typeof preSessionSchema>;
export type TradeInput = z.infer<typeof tradeSchema>;
export type PostSessionInput = z.infer<typeof postSessionSchema>;
