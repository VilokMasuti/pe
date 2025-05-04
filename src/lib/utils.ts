/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import {
  addDays,
  differenceInDays,
  format,
  getDaysInMonth,
  isSameDay,
  isWithinInterval,
  subDays,
} from "date-fns"
import { twMerge } from "tailwind-merge"

//  Utility to combine Tailwind CSS class names and remove duplicates/conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // clsx handles conditional logic, twMerge removes conflicting classes
}

//  Format a Date object as "Month day, year" (e.g., "April 30, 2025")
export function formatDate(date: Date): string {
  return format(date, "MMMM d, yyyy")
}

//  Format a Date object as "Mon day" (e.g., "Apr 30")
export function formatShortDate(date: Date): string {
  return format(date, "MMM d")
}

//  Get number of days in a given month (0-indexed month)
export function getDaysInMonthCount(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month)) // Creates a date with given year/month, returns days in that month
//   Returns how many days are in the given month/year.

// month is 0-indexed, so January = 0, February = 1, etc.
}

//  Get the full name of a month from its 0-indexed number
export function getMonthName(month: number): string {
  return format(new Date(2000, month, 1), "MMMM") // Use arbitrary year to get month name
//   Gets the full name of a month (e.g., 0 → "January").

// Uses arbitrary year 2000 because we only care about the month.
}

//  Calculate the next period date by adding the cycle length to the last period start
export function calculateNextPeriod(lastPeriod: Date, cycleLength: number): Date {
   return addDays(lastPeriod, cycleLength)
  // Adds cycleLength days to the last period start date to predict the next period date.
}

//  Calculate fertile window: 5 days before ovulation + ovulation day + 1 day after
//  If next period is April 29th → fertile days ≈ April 10-16.
export function calculateFertileWindow(nextPeriod: Date): { start: Date; end: Date } {
  const ovulationDay = subDays(nextPeriod, 14)       // Ovulation occurs ~14 days before next period
  const fertileStart = subDays(ovulationDay, 5)      // Fertile window starts 5 days before ovulation
  const fertileEnd = addDays(ovulationDay, 1)        // Ends 1 day after ovulation
  return { start: fertileStart, end: fertileEnd }
}







//  Calculate ovulation day by subtracting 14 days from the next period
export function calculateOvulationDay(nextPeriod: Date): Date {
  return subDays(nextPeriod, 14)
}
// Ovulation happens ~14 days before next period.

// April 29th → ovulation on April 15th.


//  Calculate how many days from today until a given date

// daysUntil = Count sleeps until event.
export function daysUntil(targetDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)                         // Reset time to midnight for accurate day diff
  return differenceInDays(targetDate, today)        // Return number of days between now and target
}

//  Check if a given date is part of a known period (either start day or in range)
// isPeriodDay = Check if today is red on the calendar.
export function isPeriodDay(date: Date, periods: any[]): boolean {
  return periods.some((period) => {
    const startDate = new Date(period.start_date)

    if (!period.end_date) {
      return isSameDay(date, startDate)             // If no end date, only check if it's the start date
    }

    const endDate = new Date(period.end_date)
    return isWithinInterval(date, { start: startDate, end: endDate }) // Check if date falls within period range
  })
}

// 🌱 Check if a date falls in the fertile window for a given next period date
export function isFertileDay(date: Date, nextPeriod: Date): boolean {
  const fertileWindow = calculateFertileWindow(nextPeriod)
  return isWithinInterval(date, { start: fertileWindow.start, end: fertileWindow.end })
}

// 💧 Check if a date is the ovulation day
export function isOvulationDay(date: Date, nextPeriod: Date): boolean {
  const ovulationDay = calculateOvulationDay(nextPeriod)
  return isSameDay(date, ovulationDay)
}

// ⏳ Calculate how long a period lasted (in days)
export function calculatePeriodDuration(startDate: Date, endDate: Date | null): number {
  if (!endDate) return 1                             // If no end date, assume 1 day
  return differenceInDays(endDate, startDate) + 1    // Inclusive duration (end - start + 1)
}

// 📊 Calculate the average cycle length based on list of periods
export function calculateAverageCycleLength(periods: any[]): number {
  // if (periods.length < 2) return 28                  // Needs at least 2 periods to calculate an average

  // Defaults to 28 days (common average cycle length)

  const cycleLengths = []
  // Compares consecutive period start dates

  // Example:

  // Period 1: April 1

  // Period 2: April 28

  // Cycle Length: 27 days (April 28 - April 1)
  for (let i = 0; i < periods.length - 1; i++) {
    const currentStart = new Date(periods[i].start_date)
    const nextStart = new Date(periods[i + 1].start_date)
    cycleLengths.push(differenceInDays(nextStart, currentStart)) // Calculate days between each start date
  }

  const sum = cycleLengths.reduce((total, length) => total + length, 0)
  return Math.round(sum / cycleLengths.length)       // Return average cycle length (rounded)
}


// here's a summary of the utility functions in the code:
// 1. `cn`: Combines Tailwind CSS class names and removes duplicates/conflicts.
// 2. `formatDate`: Formats a Date object as "Month day, year" (e.g., "April 30, 2025").
// 3. `formatShortDate`: Formats a Date object as "Mon day" (e.g., "Apr 30").
// 4. `getDaysInMonthCount`: Returns how many days are in a given month/year.
// 5. `getMonthName`: Gets the full name of a month from its 0-indexed number (e.g., 0 → "January").
// 6. `calculateNextPeriod`: Calculates the next period date by adding the cycle length to the last period start.
// 7. `calculateFertileWindow`: Calculates the fertile window (5 days before ovulation + ovulation day + 1 day after).
// 8. `calculateOvulationDay`: Calculates ovulation day by subtracting 14 days from the next period.
// 9. `daysUntil`: Returns how many days from today until a given date.
// 10. `isPeriodDay`: Checks if a given date is part of a known period (either start day or in range).
// 11. `isFertileDay`: Checks if a date falls in the fertile window for a given next period date.
// 12. `isOvulationDay`: Checks if a date is the ovulation day.
// 13. `calculatePeriodDuration`: Calculates how long a period lasted (in days).
// 14. `calculateAverageCycleLength`: Calculates the average cycle length based on a list of periods.
