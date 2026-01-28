export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          timezone: string
          discipline_goal: number
          tilt_alert_settings: TiltAlertSettings
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          timezone?: string
          discipline_goal?: number
          tilt_alert_settings?: TiltAlertSettings
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          timezone?: string
          discipline_goal?: number
          tilt_alert_settings?: TiltAlertSettings
          created_at?: string
          updated_at?: string
        }
      }
      rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: RuleCategory
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: RuleCategory
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: RuleCategory
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          started_at: string
          ended_at: string | null
          status: SessionStatus
          pre_session: PreSessionData
          post_session: PostSessionData | null
          discipline_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          started_at?: string
          ended_at?: string | null
          status?: SessionStatus
          pre_session?: PreSessionData
          post_session?: PostSessionData | null
          discipline_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          started_at?: string
          ended_at?: string | null
          status?: SessionStatus
          pre_session?: PreSessionData
          post_session?: PostSessionData | null
          discipline_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          session_id: string
          user_id: string
          trade_number: number
          result: TradeResult
          pnl: number | null
          rules_followed: boolean
          broken_rule_ids: string[]
          emotion_tag: EmotionTag
          notes: string | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          trade_number: number
          result: TradeResult
          pnl?: number | null
          rules_followed?: boolean
          broken_rule_ids?: string[]
          emotion_tag: EmotionTag
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          trade_number?: number
          result?: TradeResult
          pnl?: number | null
          rules_followed?: boolean
          broken_rule_ids?: string[]
          emotion_tag?: EmotionTag
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
      }
      breaks: {
        Row: {
          id: string
          session_id: string
          started_at: string
          ended_at: string | null
          reason: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          started_at?: string
          ended_at?: string | null
          reason?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          started_at?: string
          ended_at?: string | null
          reason?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Custom types
export type RuleCategory = 'risk' | 'entry' | 'exit' | 'timing' | 'mindset'

export type SessionStatus = 'active' | 'completed'

export type TradeResult = 'win' | 'loss' | 'breakeven'

export type EmotionTag = 'confident' | 'calm' | 'fomo' | 'revenge' | 'fearful' | 'frustrated'

export interface TiltAlertSettings {
  consecutiveLosses: number
  totalTrades: number
  brokenRules: number
}

export interface PreSessionData {
  sleepRating?: number
  stressLevel?: number
  focusRating?: number
  wellnessNotes?: string
  plannedSetups?: string
  maxTrades?: number
  maxLoss?: number
  rulesConfirmed?: boolean
}

export interface PostSessionData {
  planFollowedRating?: number
  emotionalControlRating?: number
  whatWentWell?: string
  whatToImprove?: string
  tomorrowFocus?: string
}

// Convenience types for table rows
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Rule = Database['public']['Tables']['rules']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type Break = Database['public']['Tables']['breaks']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type RuleInsert = Database['public']['Tables']['rules']['Insert']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type TradeInsert = Database['public']['Tables']['trades']['Insert']
export type BreakInsert = Database['public']['Tables']['breaks']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type RuleUpdate = Database['public']['Tables']['rules']['Update']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']
export type TradeUpdate = Database['public']['Tables']['trades']['Update']
export type BreakUpdate = Database['public']['Tables']['breaks']['Update']
