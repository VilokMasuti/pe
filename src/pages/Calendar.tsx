/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {
  addMonths,
  format,
  isSameDay,
  isWithinInterval,
  subMonths,
} from 'date-fns';
import { AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Building blocks for our calendar interface
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardHeader } from '../components/ui/card';

// Connection to our database and calculations
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import {
  fetchPeriods,
  fetchSettings,
  type Period,
  type Settings,
} from '../lib/supabase';
import {
  calculateFertileWindow,
  calculateNextPeriod,
  calculateOvulationDay,
} from '../lib/utils';

// Loading and error components
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export default function CalendarPage() {
  // Our calendar's memory:
  const [currentDate, setCurrentDate] = useState(new Date()); // What month we're viewing
  const [periods, setPeriods] = useState<Period[]>([]); // User's period history
  const [settings, setSettings] = useState<Settings | null>(null); // User preferences
  const [loading, setLoading] = useState(true); // Loading spinner control
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Clicked date
  const [error, setError] = useState<string | null>(null); // Error messages
  const { toast } = useToast(); // Popup notifications

  // When page loads: Get period history and user settings
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true); // Show loading spinner
        setError(null); // Clear old errors

        // Get both period history and settings at the same time
        const [periodsData, settingsData] = await Promise.all([
          fetchPeriods(), // Get past periods
          fetchSettings(), // Get user preferences
        ]);

        setPeriods(periodsData); // Save period history
        setSettings(settingsData); // Save user settings
      } catch (error) {
        // Show error message if something goes wrong
        setError('Failed to load calendar. Check internet and try again.');
        toast({
          /* Error popup */
        });
      } finally {
        setLoading(false); // Hide loading spinner
      }
    }

    loadData();
  }, [toast]);

  // Predict next period and fertile days using:
  // - Last period date
  // - User's average cycle length
  const { fertileWindow, ovulationDay } = useMemo(() => {
    if (!settings || periods.length === 0) return {}; // Wait until we have data

    const lastPeriod = new Date(periods[0].start_date); // Most recent period start
    const cycleLength = settings.cycle_length; // User's average cycle days

    // Magic predictions:
    const next = calculateNextPeriod(lastPeriod, cycleLength); // Next period start
    const fertile = calculateFertileWindow(next); // Best baby-making days
    const ovulation = calculateOvulationDay(next); // Best single day

    return { fertileWindow: fertile, ovulationDay: ovulation };
  }, [periods, settings]); // Only re-calculate when these change

  // Month navigation buttons
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1)); // Back button
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1)); // Forward button

  // Date checking system
  // ====================

  // Is this date during a period?
  const isPeriodDay = (date: Date) =>
    periods.some((period) => {
      const start = new Date(period.start_date);
      const end = period.end_date ? new Date(period.end_date) : null;

      // Check if date matches single-day period or falls in multi-day range
      return end
        ? isWithinInterval(date, { start, end })
        : isSameDay(date, start);
    });

  // Is this date in the fertile window?
  const isFertileDay = (date: Date) =>
    fertileWindow && isWithinInterval(date, fertileWindow);

  // Is this exact ovulation day?
  const isOvulationDay = (date: Date) =>
    ovulationDay && isSameDay(date, ovulationDay);

  // Info about clicked date (memoized for performance)
  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null; // No date selected

    return {
      isPeriod: isPeriodDay(selectedDate), // Red dot
      isFertile: isFertileDay(selectedDate), // Pink background
      isOvulation: isOvulationDay(selectedDate), // Dark pink dot
      date: selectedDate, // Actual date
    };
  }, [selectedDate]); // Only update when date changes

  // Calendar color rules
  const modifiers = useMemo(
    () => ({
      period: (date: Date) => isPeriodDay(date), // Red days
      fertile: (date: Date) => !!(isFertileDay(date) && !isOvulationDay(date)), // Pink days
      ovulation: (date: Date) => !!isOvulationDay(date), // Dark pink dot
    }),
    [periods, fertileWindow, ovulationDay]
  );

  // Actual colors and styles for calendar dots
  const modifiersStyles = {
    period: { backgroundColor: 'var(--primary)', borderRadius: '9999px' }, // Red
    fertile: { backgroundColor: '#fbcfe8', borderRadius: '9999px' }, // Light pink
    ovulation: {
      backgroundColor: '#ec4899',
      color: 'white',
      borderRadius: '9999px',
    }, // Dark pink
  };

  // The actual calendar display
  return  (
    <div className="space-y-6">
      {/* Header with title and "Add Period" button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight">Calendar</h2>
        <Button asChild>
          <Link to="/add">
            <Plus className="mr-2 h-4 w-4" />
            Log Period
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar Card */}
      <Card>
        {/* Month Navigation */}
        <CardHeader className="flex items-center justify-between pb-4">
          <Button variant="outline" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{format(currentDate, 'MMMM yyyy')}</h3>
          <Button variant="outline" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Calendar */}
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <Calendar
              mode="single"
              month={currentDate}
              onMonthChange={setCurrentDate}
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={() => false}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
            />
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary" /> Period
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-500" /> Ovulation
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-200 text-pink-800" /> Fertile
            </div>
          </div>

          {/* Date Info */}
          {selectedDateInfo && (
            <div className="border rounded-md p-4 bg-muted/50">
              <h4 className="text-lg font-medium mb-2">
                {format(selectedDateInfo.date, 'MMMM d, yyyy')}
              </h4>
              <ul className="space-y-1 text-sm">
                {selectedDateInfo.isPeriod && <li>🔴 Period day</li>}
                {selectedDateInfo.isOvulation && <li>🌸 Ovulation day</li>}
                {selectedDateInfo.isFertile && <li>💖 Fertile day</li>}
                {!selectedDateInfo.isPeriod &&
                  !selectedDateInfo.isOvulation &&
                  !selectedDateInfo.isFertile && <li>No events for this day.</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
