/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { fetchAllPeriodsWithDetails, fetchPeriods, fetchSettings, type Period, type Settings } from "../lib/supabase"
import { useToast } from "../components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function Stats() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [cycleStats, setCycleStats] = useState({
    averageCycle: 0,
    shortestCycle: 0,
    longestCycle: 0,
    averagePeriod: 0,
  })
  const [symptomStats, setSymptomStats] = useState<{ name: string; count: number }[]>([])
  const [moodStats, setMoodStats] = useState<{ name: string; count: number }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [periodsData, settingsData] = await Promise.all([fetchAllPeriodsWithDetails(), fetchSettings()])

        setPeriods(periodsData)
        setSettings(settingsData)

        // Calculate statistics
        if (periodsData.length > 1) {
          calculateCycleStats(periodsData)
        }

        // Calculate symptom and mood stats
        calculateSymptomAndMoodStats(periodsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your statistics. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const calculateSymptomAndMoodStats = (periodsData: Period[]) => {
    const symptomCounts: Record<string, number> = {}
    const moodCounts: Record<string, number> = {}

    for (const period of periodsData) {
      // Check if symptoms exist and are an array
      if (period.symptoms && Array.isArray(period.symptoms)) {
        for (const symptom of period.symptoms) {
          symptomCounts[symptom.symptom_type] = (symptomCounts[symptom.symptom_type] || 0) + 1
        }
      }

      // Check if moods exist and are an array
      if (period.moods && Array.isArray(period.moods)) {
        for (const mood of period.moods) {
          moodCounts[mood.mood_type] = (moodCounts[mood.mood_type] || 0) + 1
        }
      }
    }

    // Convert to array format for charts
    const symptomStats = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name: formatLabel(name), count }))
      .sort((a, b) => b.count - a.count)

    const moodStats = Object.entries(moodCounts)
      .map(([name, count]) => ({ name: formatLabel(name), count }))
      .sort((a, b) => b.count - a.count)

    setSymptomStats(symptomStats)
    setMoodStats(moodStats)
  }

  const calculateCycleStats = (periodsData: Period[]) => {
    // Sort periods by start date (newest first)
    const sortedPeriods = [...periodsData].sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    )

    const cycleLengths: number[] = []
    const periodLengths: number[] = []

    // Calculate cycle lengths (time between period start dates)
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const currentPeriodStart = new Date(sortedPeriods[i].start_date)
      const nextPeriodStart = new Date(sortedPeriods[i + 1].start_date)

      const cycleDays = Math.round((currentPeriodStart.getTime() - nextPeriodStart.getTime()) / (1000 * 60 * 60 * 24))
      cycleLengths.push(cycleDays)
    }

    // Calculate period lengths
    for (const period of sortedPeriods) {
      if (period.end_date) {
        const startDate = new Date(period.start_date)
        const endDate = new Date(period.end_date)

        const periodDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        periodLengths.push(periodDays)
      }
    }

    // Calculate statistics
    const averageCycle =
      cycleLengths.length > 0
        ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
        : 0

    const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0

    const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0

    const averagePeriod =
      periodLengths.length > 0
        ? Math.round(periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length)
        : 0

    setCycleStats({
      averageCycle,
      shortestCycle,
      longestCycle,
      averagePeriod,
    })
  }

  const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("_", " ")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-[200px] rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ) : periods.length < 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Not Enough Data</CardTitle>
            <CardDescription>Log at least two periods to see your cycle statistics.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStats.averageCycle} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shortest Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStats.shortestCycle} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Longest Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStats.longestCycle} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStats.averagePeriod} days</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Symptoms</CardTitle>
                <CardDescription>Your most frequently logged symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                {symptomStats.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={symptomStats.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No symptom data recorded yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Moods</CardTitle>
                <CardDescription>Your most frequently logged moods</CardDescription>
              </CardHeader>
              <CardContent>
                {moodStats.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={moodStats.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No mood data recorded yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
