// Import the Supabase client creator and types
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
// createClient: Function to initialize the connection to your Supabase project.

// Database: A TypeScript type to define your database schema. Helps with autocompletion and type safety.
// Load environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Throw error if any required env variable is missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Initialize the Supabase client with strong typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Define the Period type and related subtypes (used for periods tracking)
export type Period = {
  id: string
  start_date: string
  end_date: string | null
  flow_level: number
  notes: string | null
  created_at: string
  symptoms?: Symptom[]
  moods?: Mood[]
}

export type Symptom = {
  id: string
  period_id: string
  symptom_type: string
  severity: number
  created_at: string
}

export type Mood = {
  id: string
  period_id: string
  mood_type: string
  intensity: number
  created_at: string
}

export type Settings = {
  id: string
  cycle_length: number
  period_length: number
  notifications_enabled: boolean
  theme: string
}

// Fallback default settings used when Supabase fetch fails
const DEFAULT_SETTINGS: Omit<Settings, "id"> = {
  cycle_length: 28,
  period_length: 5,
  notifications_enabled: false,
  theme: "light",
}

// Fetch periods ordered from most recent to oldest
export async function fetchPeriods(): Promise<Period[]> {
  try {
    const { data, error } = await supabase
      .from("periods")
      .select("*")
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching periods:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching periods:", error)
    return []
  }
}

// Fetch a specific period with its symptoms and moods using relational queries
export async function fetchPeriodWithDetails(periodId: string): Promise<Period | null> {
  try {
    const { data, error } = await supabase
      .from("periods")
      .select(`
        *,
        symptoms(*),
        moods(*)
      `)
      .eq("id", periodId)
      .single()

    if (error) {
      console.error("Error fetching period details:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception fetching period details:", error)
    return null
  }
}

// Fetch all periods along with their symptoms and moods
export async function fetchAllPeriodsWithDetails(): Promise<Period[]> {
  try {
    const { data, error } = await supabase
      .from("periods")
      .select(`
        *,
        symptoms(*),
        moods(*)
      `)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching all periods with details:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching all periods with details:", error)
    return []
  }
}

// Add a new period record to the "periods" table
export async function addPeriod(period: Omit<Period, "id" | "created_at">): Promise<Period> {
  try {
    const { data, error } = await supabase
      .from("periods")
      .insert(period)
      .select()
      .single()

    if (error) {
      console.error("Error adding period:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception adding period:", error)
    throw error
  }
}

// Update a period record by ID
export async function updatePeriod(id: string, period: Partial<Period>): Promise<Period> {
  try {
    const { data, error } = await supabase
      .from("periods")
      .update(period)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating period:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception updating period:", error)
    throw error
  }
}

// Delete a period by ID
export async function deletePeriod(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("periods").delete().eq("id", id)

    if (error) {
      console.error("Error deleting period:", error)
      throw error
    }
  } catch (error) {
    console.error("Exception deleting period:", error)
    throw error
  }
}

// Add a new symptom record
export async function addSymptom(symptom: Omit<Symptom, "id" | "created_at">): Promise<Symptom> {
  try {
    const { data, error } = await supabase
      .from("symptoms")
      .insert(symptom)
      .select()
      .single()

    if (error) {
      console.error("Error adding symptom:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception adding symptom:", error)
    throw error
  }
}

// Add a new mood record
export async function addMood(mood: Omit<Mood, "id" | "created_at">): Promise<Mood> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .insert(mood)
      .select()
      .single()

    if (error) {
      console.error("Error adding mood:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception adding mood:", error)
    throw error
  }
}

// Fetch the user settings; fallback to default if error occurs
export async function fetchSettings(): Promise<Settings> {
  try {
    const { data, error } = await supabase.from("settings").select("*").single()

    if (error) {
      console.error("Error fetching settings:", error)
      return { id: "default", ...DEFAULT_SETTINGS }
    }

    return data
  } catch (error) {
    console.error("Exception fetching settings:", error)
    return { id: "default", ...DEFAULT_SETTINGS }
  }
}

// Update settings; fallback to in-memory update if database write fails
export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  try {
    const currentSettings = await fetchSettings()

    const { data, error } = await supabase
      .from("settings")
      .upsert({
        id: currentSettings.id === "default" ? undefined : currentSettings.id,
        cycle_length: settings.cycle_length || currentSettings.cycle_length,
        period_length: settings.period_length || currentSettings.period_length,
        notifications_enabled:
          settings.notifications_enabled !== undefined
            ? settings.notifications_enabled
            : currentSettings.notifications_enabled,
        theme: settings.theme || currentSettings.theme,
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating settings:", error)
      return {
        ...currentSettings,
        ...settings,
      }
    }

    return data
  } catch (error) {
    console.error("Exception updating settings:", error)
    const currentSettings = await fetchSettings()
    return {
      ...currentSettings,
      ...settings,
    }
  }
}

// Initialize settings, fallback to defaults if database fetch fails
export async function initializeDefaultSettings(): Promise<Settings> {
  try {
    const settings = await fetchSettings()
    return settings
  } catch (error) {
    console.error("Error initializing settings:", error)
    return { id: "default", ...DEFAULT_SETTINGS }
  }
}
