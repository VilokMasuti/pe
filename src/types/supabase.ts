export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      periods: {
        Row: {
          id: string
          start_date: string
          end_date: string | null
          flow_level: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          start_date: string
          end_date?: string | null
          flow_level: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          start_date?: string
          end_date?: string | null
          flow_level?: number
          notes?: string | null
          created_at?: string
        }
      }
      symptoms: {
        Row: {
          id: string
          period_id: string
          symptom_type: string
          severity: number
          created_at: string
        }
        Insert: {
          id?: string
          period_id: string
          symptom_type: string
          severity: number
          created_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          symptom_type?: string
          severity?: number
          created_at?: string
        }
      }
      moods: {
        Row: {
          id: string
          period_id: string
          mood_type: string
          intensity: number
          created_at: string
        }
        Insert: {
          id?: string
          period_id: string
          mood_type: string
          intensity: number
          created_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          mood_type?: string
          intensity?: number
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          cycle_length: number
          period_length: number
          notifications_enabled: boolean
          theme: string
        }
        Insert: {
          id?: string
          cycle_length: number
          period_length: number
          notifications_enabled: boolean
          theme: string
        }
        Update: {
          id?: string
          cycle_length?: number
          period_length?: number
          notifications_enabled?: boolean
          theme?: string
        }
      }
    }
  }
}
