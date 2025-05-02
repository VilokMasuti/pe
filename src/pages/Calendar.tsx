/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { ChevronLeft, ChevronRight, Plus, Droplets, CircleDot, Heart, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { addMonths, format, isSameDay, isWithinInterval, subMonths } from "date-fns"

import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import {
  Card,
  CardContent,

  CardHeader,

} from '../components/ui/card';
import { fetchPeriods, fetchSettings, type Period, type Settings } from "../lib/supabase"
import { calculateFertileWindow, calculateNextPeriod, calculateOvulationDay } from "../lib/utils"
import { useToast } from '../components/ui/use-toast';
import { Link } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";


export default function CalendarPage() {
  // State for current displayed month
  const [currentDate, setCurrentDate] = useState(new Date())
  // State for period data
  const [periods, setPeriods] = useState<Period[]>([])
  // State for user settings
  const [settings, setSettings] = useState<Settings | null>(null)
  // Loading state for data fetching
  const [loading, setLoading] = useState(true)
  // State for selected date in calendar
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  // State for error message
  const [error, setError] = useState<string | null>(null)
  // Toast hook for notifications
  const { toast } = useToast()

  // Load period and settings data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch periods and settings data in parallel
        const [periodsData, settingsData] = await Promise.all([fetchPeriods(), fetchSettings()])

        setPeriods(periodsData)
        setSettings(settingsData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load your calendar data. Please check your connection and try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your calendar data. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Calculate next period and fertile window
  const {  fertileWindow, ovulationDay } = useMemo(() => {
    if (!settings || periods.length === 0) {
      return { nextPeriod: null, fertileWindow: null, ovulationDay: null }
    }

    // Get the most recent period
    const lastPeriod = new Date(periods[0].start_date)
    const cycleLength = settings.cycle_length

    // Calculate next period
    const next = calculateNextPeriod(lastPeriod, cycleLength)

    // Calculate fertile window
    const fertile = calculateFertileWindow(next)

    // Calculate ovulation day
    const ovulation = calculateOvulationDay(next)

    return { nextPeriod: next, fertileWindow: fertile, ovulationDay: ovulation }
  }, [periods, settings])

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Helper function to check if a date is within a period
  const isPeriodDay = (date: Date) => {
    return periods.some((period) => {
      // Convert string date to Date object
      const startDate = new Date(period.start_date)

      // If no end date, check if it's the start date
      if (!period.end_date) {
        return isSameDay(date, startDate)
      }

      // If end date exists, check if date is within the period interval
      const endDate = new Date(period.end_date)
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
  }

  // Helper function to check if a date is within the fertile window
  const isFertileDay = (date: Date) => {
    if (!fertileWindow) return false

    return isWithinInterval(date, {
      start: fertileWindow.start,
      end: fertileWindow.end,
    })
  }

  // Helper function to check if a date is the ovulation day
  const isOvulationDay = (date: Date) => {
    if (!ovulationDay) return false

    return isSameDay(date, ovulationDay)
  }

  // Get information about the selected date
  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null

    return {
      isPeriod: isPeriodDay(selectedDate),
      isFertile: isFertileDay(selectedDate),
      isOvulation: isOvulationDay(selectedDate),
      date: selectedDate,
    }
  }, [selectedDate])

  // Custom modifiers for the calendar
  const modifiers = useMemo(() => {
    return {
      period: (date: Date) => isPeriodDay(date),
      fertile: (date: Date) => isFertileDay(date) && !isOvulationDay(date),
      ovulation: (date: Date) => isOvulationDay(date),
    }
  }, [periods, fertileWindow, ovulationDay])

  // Custom modifier styles for the calendar
  const modifiersStyles = {
    period: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      borderRadius: "9999px",
    },
    fertile: {
      backgroundColor: "hsl(var(--pink-200, 326 85% 90%))",
      color: "hsl(var(--foreground))",
      borderRadius: "9999px",
    },
    ovulation: {
      backgroundColor: "hsl(var(--pink-500, 336 80% 58%))",
      color: "white",
      borderRadius: "9999px",
    },
  }

  return (
    <div className="space-y-6">
      {/* Page header with title and add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
        <Button variant="default" size="sm" asChild>
          <Link to="/add">
            <Plus className="mr-2 h-4 w-4" />
            Log Period
          </Link>
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar card */}
      <Card>
        {/* Calendar header with navigation buttons */}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h3>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Show loading state or calendar */}
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <Calendar
              mode="single"
              month={currentDate}
              onMonthChange={setCurrentDate}
              className="rounded-md border"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={() => false}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
            />
          )}

          {/* Legend for calendar markers */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center">
              <Badge variant="default" className="mr-2 h-4 w-4 rounded-full p-0" />
              <span>Period</span>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-2 h-4 w-4 rounded-full p-0 bg-pink-500" />
              <span>Ovulation</span>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-2 h-4 w-4 rounded-full p-0 bg-pink-200 dark:bg-pink-900" />
              <span>Fertile Window</span>
            </div>
          </div>

          {/* Selected date information */}
          {selectedDateInfo && (
            <div className="mt-4 p-4 border rounded-md bg-background">
              <h4 className="font-medium mb-2">{format(selectedDateInfo.date, "MMMM d, yyyy")}</h4>
              {selectedDateInfo.isPeriod && (
                <div className="flex items-center text-primary mb-1">
                  <Droplets className="h-4 w-4 mr-2" />
                  <span>Period day</span>
                </div>
              )}
              {selectedDateInfo.isOvulation && (
                <div className="flex items-center text-pink-500 mb-1">
                  <CircleDot className="h-4 w-4 mr-2" />
                  <span>Ovulation day</span>
                </div>
              )}
              {selectedDateInfo.isFertile && !selectedDateInfo.isOvulation && (
                <div className="flex items-center text-pink-400 mb-1">
                  <Heart className="h-4 w-4 mr-2" />
                  <span>Fertile day</span>
                </div>
              )}
              {!selectedDateInfo.isPeriod && !selectedDateInfo.isFertile && (
                <div className="text-muted-foreground">No special events</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
