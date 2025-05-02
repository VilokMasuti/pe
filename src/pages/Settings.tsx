"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Bell, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { fetchSettings, initializeDefaultSettings, updateSettings, type Settings } from "../lib/supabase"
import { useToast } from "../components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Skeleton } from "../components/ui/skeleton"



export default function SettingsPage() {
  // State for user settings
  const [settings, setSettings] = useState<Settings | null>(null)
  // State for cycle length input
  const [cycleLength, setCycleLength] = useState(28)
  // State for period length input
  const [periodLength, setPeriodLength] = useState(5)
  // State for notifications toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true)
  // State for save operation
  const [saving, setSaving] = useState(false)
  // State to track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false)
  // State for success message
  const [saveSuccess, setSaveSuccess] = useState(false)
  // State for error message
  const [error, setError] = useState<string | null>(null)
  // Toast hook for notifications
  const { toast } = useToast()

  // Load settings on component mount
  useEffect(() => {
    async function loadSettings() {
      try {
        // Set loading state while fetching data
        setLoading(true)
        setError(null)

        // Initialize default settings if none exist
        await initializeDefaultSettings()

        // Fetch settings from the database
        const settingsData = await fetchSettings()

        // If settings exist, update state with the values
        if (settingsData) {
          setSettings(settingsData)
          setCycleLength(settingsData.cycle_length)
          setPeriodLength(settingsData.period_length)
          setNotificationsEnabled(settingsData.notifications_enabled)
        }
      } catch (error) {
        // Log and display error if settings fetch fails
        console.error("Error loading settings:", error)
        setError("Failed to load your settings. Please check your connection and try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your settings. Please try again.",
        })
      } finally {
        // Set loading state to false when done
        setLoading(false)
      }
    }

    // Call the settings loading function
    loadSettings()
  }, [toast])

  // Track changes to enable/disable save button
  useEffect(() => {
    // Skip if settings haven't been loaded yet
    if (!settings) return

    // Check if any setting has changed from the saved values
    const hasChanged =
      cycleLength !== settings.cycle_length ||
      periodLength !== settings.period_length ||
      notificationsEnabled !== settings.notifications_enabled

    // Update the hasChanges state
    setHasChanges(hasChanged)
  }, [cycleLength, periodLength, notificationsEnabled, settings])

  // Hide success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Clean up timer on unmount
      return () => clearTimeout(timer)
    }
  }, [saveSuccess])

  // Handle cycle length input change with validation
  const handleCycleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    // Only update if value is within valid range
    if (value >= 21 && value <= 45) {
      setCycleLength(value)
    }
  }

  // Handle period length input change with validation
  const handlePeriodLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    // Only update if value is within valid range
    if (value >= 1 && value <= 10) {
      setPeriodLength(value)
    }
  }

  // Save settings to the database
  const handleSaveSettings = async () => {
    try {
      // Set saving state to true while updating
      setSaving(true)
      setError(null)

      // Update settings in the database
      await updateSettings({
        cycle_length: cycleLength,
        period_length: periodLength,
        notifications_enabled: notificationsEnabled,
        theme: settings?.theme || "light",
      })

      // Update local settings state to reflect saved changes
      setSettings((prev) => ({
        ...(prev || ({} as Settings)),
        cycle_length: cycleLength,
        period_length: periodLength,
        notifications_enabled: notificationsEnabled,
      }))

      // Reset hasChanges flag
      setHasChanges(false)

      // Show success message
      setSaveSuccess(true)

      // Show success toast
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      // Log and display error if save fails
      console.error("Error saving settings:", error)
      setError("Failed to save your settings. Please check your connection and try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your settings. Please try again.",
      })
    } finally {
      // Set saving state to false when done
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {saveSuccess && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      {/* Show loading state or settings form */}
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cycle Settings</CardTitle>
            <CardDescription>Customize your period tracking preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cycle length input */}
            <div className="space-y-2">
              <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cycle-length"
                  type="number"
                  min={21}
                  max={45}
                  value={cycleLength}
                  onChange={handleCycleLengthChange}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">(21-45 days)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The average length of your menstrual cycle (from the first day of your period to the day before your
                next period)
              </p>
            </div>

            {/* Period length input */}
            <div className="space-y-2">
              <Label htmlFor="period-length">Average Period Length (days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="period-length"
                  type="number"
                  min={1}
                  max={10}
                  value={periodLength}
                  onChange={handlePeriodLengthChange}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">(1-10 days)</span>
              </div>
              <p className="text-xs text-muted-foreground">The average number of days your period typically lasts</p>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center space-x-2">
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              <Label htmlFor="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Enable Notifications
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-7">
              Receive notifications for upcoming periods and fertile windows
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* Status message */}
            <p className="text-sm text-muted-foreground">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </p>
            {/* Save button */}
            <Button
              onClick={handleSaveSettings}
              disabled={saving || !hasChanges}
              className={hasChanges ? "animate-pulse" : ""}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
