/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  AlertCircle,
  CalendarIcon,
  ChevronRight,
  Droplets,
  Plus,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ui/use-toast';
import { WelcomeGuide } from '../components/welcome-guide';
import {
  fetchPeriods,
  fetchSettings,
  initializeDefaultSettings,
  type Period,
  type Settings as SettingsType,
} from '../lib/supabase';
import {
  calculateFertileWindow,
  calculateNextPeriod,
  calculatePeriodDuration,
  daysUntil,
  formatDate,
  formatShortDate,
} from '../lib/utils';

export default function Dashboard() {
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for period data
  const [periods, setPeriods] = useState<Period[]>([]);
  // State for user settings
  const [settings, setSettings] = useState<SettingsType | null>(null);
  // State for next period date
  const [nextPeriod, setNextPeriod] = useState<Date | null>(null);
  // State for fertile window
  const [fertileWindow, setFertileWindow] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  // State for showing onboarding guide
  const [showOnboarding, setShowOnboarding] = useState(false);
  // State for error message
  const [error, setError] = useState<string | null>(null);
  // Toast hook for notifications
  const { toast } = useToast();

  // Load period and settings data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Initialize default settings if none exist
        await initializeDefaultSettings();

        // Fetch periods and settings data
        const [periodsData, settingsData] = await Promise.all([
          fetchPeriods(),
          fetchSettings(),
        ]);

        setPeriods(periodsData);
        setSettings(settingsData);

        // Show onboarding if no periods exist
        setShowOnboarding(periodsData.length === 0);

        // Calculate next period and fertile window if data is available
        if (periodsData.length > 0 && settingsData) {
          const lastPeriod = new Date(periodsData[0].start_date);
          const cycleLength = settingsData.cycle_length;

          const next = calculateNextPeriod(lastPeriod, cycleLength);
          setNextPeriod(next);

          const fertile = calculateFertileWindow(next);
          setFertileWindow(fertile);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(
          'Failed to load your data. Please check your connection and try again.'
        );
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your data. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Calculate days until next period
  const daysUntilNextPeriod = nextPeriod ? daysUntil(nextPeriod) : null;

  // Get last period information
  const lastPeriod =
    periods.length > 0 ? new Date(periods[0].start_date) : null;
  const lastPeriodEndDate =
    periods.length > 0 && periods[0].end_date
      ? new Date(periods[0].end_date)
      : null;
  const lastPeriodDuration =
    lastPeriod && lastPeriodEndDate
      ? calculatePeriodDuration(lastPeriod, lastPeriodEndDate)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/add">
              <Plus className="mr-2 h-4 w-4" />
              Log Period
            </Link>
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show welcome guide for new users */}
      {!loading && periods.length === 0 && <WelcomeGuide />}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[160px] w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      ) : showOnboarding ? (
        <Card className="border-dashed border-2 border-primary/50">
          <CardHeader>
            <CardTitle className="text-center">
              Welcome to Your Period Tracker
            </CardTitle>
            <CardDescription className="text-center">
              Get started by logging your first period to see predictions and
              insights
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-full bg-primary/10 p-4">
              <Droplets className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center max-w-md">
              <p>
                Track your periods, symptoms, and moods to get personalized
                insights about your cycle.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button size="lg" asChild>
              <Link to="/add">
                <Plus className="mr-2 h-5 w-5" />
                Log Your First Period
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          {/* Next Period Card */}
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="mr-2 h-5 w-5" />
                Next Period
              </CardTitle>
              <CardDescription>Based on your cycle history</CardDescription>
            </CardHeader>
            <CardContent>
              {nextPeriod ? (
                <div className="text-2xl font-bold">
                  {daysUntilNextPeriod === 0
                    ? 'Today'
                    : daysUntilNextPeriod === 1
                    ? 'Tomorrow'
                    : daysUntilNextPeriod && daysUntilNextPeriod > 0
                    ? `In ${daysUntilNextPeriod} days`
                    : 'Started'}
                  <div className="mt-1 text-sm font-normal text-muted-foreground">
                    {formatDate(nextPeriod)}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Add your first period to see predictions
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/add">
                  Log Period
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Fertile Window and Last Period Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border-pink-200/50 dark:border-pink-900/50">
              <CardHeader className="bg-pink-50/50 dark:bg-pink-900/20 rounded-t-lg">
                <CardTitle>Fertile Window</CardTitle>
                <CardDescription>Your estimated fertile days</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {fertileWindow ? (
                  <div>
                    <div className="font-medium">
                      {formatShortDate(fertileWindow.start)} -{' '}
                      {formatShortDate(fertileWindow.end)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Based on your average cycle length of{' '}
                      {settings?.cycle_length || 28} days
                    </div>
                    <div className="text-sm mt-2">
                      <span className="font-medium">Ovulation:</span>{' '}
                      {formatShortDate(
                        calculateFertileWindow(nextPeriod!).start
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Add your period data to see fertility predictions
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle>Last Period</CardTitle>
                <CardDescription>Your most recent period</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {lastPeriod ? (
                  <div>
                    <div className="font-medium">{formatDate(lastPeriod)}</div>
                    {lastPeriodDuration && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Duration: {lastPeriodDuration} days
                      </div>
                    )}
                    <div className="text-sm mt-2">
                      <span className="font-medium">Flow Level:</span>{' '}
                      {periods[0].flow_level}/5
                    </div>
                    <div className="mt-2"></div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No period data recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center"
                  asChild
                >
                  <Link to="/add">
                    <Plus className="h-6 w-6 mb-2" />
                    <span>Log Period</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center"
                  asChild
                >
                  <Link to="/calendar">
                    <CalendarIcon className="h-6 w-6 mb-2" />
                    <span>View Calendar</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center"
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
