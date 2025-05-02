/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CalendarIcon, Droplets, Frown, Smile } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Slider } from '../components/ui/slider';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { addMood, addPeriod, addSymptom } from '../lib/supabase';
import { formatDate } from '../lib/utils';

const SYMPTOMS = [
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "bloating", label: "Bloating" },
  { id: "fatigue", label: "Fatigue" },
  { id: "backache", label: "Backache" },
  { id: "nausea", label: "Nausea" },
  { id: "breast_tenderness", label: "Breast Tenderness" },
  { id: "acne", label: "Acne" },
]

const MOODS = [
  { id: "happy", label: "Happy" },
  { id: "sad", label: "Sad" },
  { id: "irritable", label: "Irritable" },
  { id: "anxious", label: "Anxious" },
  { id: "calm", label: "Calm" },
  { id: "emotional", label: "Emotional" },
  { id: "energetic", label: "Energetic" },
  { id: "tired", label: "Tired" },
]

/**
 * Component for logging period details, symptoms, and moods.
 *
 * This component provides a form to log period-related data, including start and end dates,
 * flow level, notes, symptoms, and moods. It also handles form submission to save the data
 * to a backend service.
 *
 * @component
 * @returns {JSX.Element} The rendered AddPeriod component.

 * ```
 *
 * @function AddPeriod
 *
 * @state {Date | undefined} startDate - The selected start date of the period.
 * @state {Date | undefined} endDate - The selected end date of the period (optional).
 * @state {number} flowLevel - The flow level of the period (1-5 scale).
 * @state {string} notes - Additional notes about the period.
 * @state {string[]} selectedSymptoms - List of selected symptom IDs.
 * @state {string[]} selectedMoods - List of selected mood IDs.
 * @state {Record<string, number>} symptomSeverity - Severity levels for selected symptoms.
 * @state {Record<string, number>} moodIntensity - Intensity levels for selected moods.
 * @state {boolean} loading - Indicates whether the form is submitting.
 *
 * @event handleSymptomToggle - Toggles the selection of a symptom and initializes its severity.
 * @event handleMoodToggle - Toggles the selection of a mood and initializes its intensity.
 * @event handleSubmit - Handles form submission, validates input, and saves data to the backend.
 *
 * @ui
 * - Displays a form with fields for start date, end date, flow level, notes, symptoms, and moods.
 * - Includes sliders for adjusting symptom severity and mood intensity.
 * - Provides buttons for canceling or submitting the form.
 *
 * @error
 * - Displays error toasts if required fields are missing or if saving data fails.
 *
 * @success
 * - Displays success toasts when data is saved successfully.
 */
export default function AddPeriod() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [flowLevel, setFlowLevel] = useState(3)
  const [notes, setNotes] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [symptomSeverity, setSymptomSeverity] = useState<Record<string, number>>({})
  const [moodIntensity, setMoodIntensity] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  // Function to handle toggling of symptoms
  // When a symptom is selected, it is added to the selectedSymptoms array, and its severity is initialized to 3
  // When a symptom is deselected, it is removed from the selectedSymptoms array
  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptomId)) {
        // If the symptom is already selected, remove it from the list
        return prev.filter((id) => id !== symptomId)
      } else {
        // If the symptom is not selected, add it to the list and set its severity to 3
        setSymptomSeverity((prev) => ({ ...prev, [symptomId]: 3 }))
        return [...prev, symptomId]
      }
    })
  }

  // Function to handle toggling of moods
  // When a mood is selected, it is added to the selectedMoods array, and its intensity is initialized to 3
  // When a mood is deselected, it is removed from the selectedMoods array
  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        // If the mood is already selected, remove it from the list
        return prev.filter((id) => id !== moodId)
      } else {
        // If the mood is not selected, add it to the list and set its intensity to 3
        setMoodIntensity((prev) => ({ ...prev, [moodId]: 3 }))
        return [...prev, moodId]
      }
    })
  }

  // Function to handle form submission
  // This function validates the input, saves the data to the backend, and provides feedback to the user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent the default form submission behavior

    // Check if the start date is selected; if not, show an error message
    if (!startDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a start date for your period.",
      })
      return
    }

    try {
      setLoading(true) // Set loading state to true while the form is being submitted

      // Format the start and end dates for saving to the backend
      const formattedStartDate = startDate.toISOString()
      const formattedEndDate = endDate ? endDate.toISOString() : null

      console.log("Adding period with dates:", { formattedStartDate, formattedEndDate })

      // Save the period details to the backend
      const period = await addPeriod({
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        flow_level: flowLevel,
        notes: notes || null,
      })

      console.log("Period added successfully:", period)

      // Save the selected symptoms and their severity to the backend
      const symptomPromises = selectedSymptoms.map((symptomType) =>
        addSymptom({
          period_id: period.id,
          symptom_type: symptomType,
          severity: symptomSeverity[symptomType] || 3, // Default severity is 3 if not set
        }),
      )

      // Save the selected moods and their intensity to the backend
      const moodPromises = selectedMoods.map((moodType) =>
        addMood({
          period_id: period.id,
          mood_type: moodType,
          intensity: moodIntensity[moodType] || 3, // Default intensity is 3 if not set
        }),
      )

      // Wait for all symptoms and moods to be saved
      await Promise.all([...symptomPromises, ...moodPromises])

      // Show a success message to the user
      toast({
        title: "Success",
        description: "Your period data has been saved.",
      })

      // Navigate back to the home page and force a page reload to ensure fresh data
      navigate("/")
    } catch (error) {
      console.error("Error saving period:", error)
      // Show an error message if saving data fails
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your period data. Please try again.",
      })
    } finally {
      setLoading(false) // Reset the loading state
    }
  }

  return (
    <div className="space-y-6">
      {/* This is the main container for the form */}
      <div className="flex items-center justify-between">
        {/* Title of the page */}
        <h2 className="text-2xl font-bold tracking-tight">Log Period</h2>
      </div>

      {/* The form starts here */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Card for period details */}
          <Card>
            <CardHeader>
              <CardTitle>Period Details</CardTitle>
              <CardDescription>Enter information about your period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section for selecting the start date */}
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="start-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Section for selecting the end date */}
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="end-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Section for selecting the flow level */}
              <div className="space-y-2">
                <Label>Flow Level</Label>
                <div className="flex items-center gap-4">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[flowLevel]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) => setFlowLevel(value[0])}
                    className="flex-1"
                  />
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {flowLevel === 1
                    ? "Very Light"
                    : flowLevel === 2
                      ? "Light"
                      : flowLevel === 3
                        ? "Medium"
                        : flowLevel === 4
                          ? "Heavy"
                          : "Very Heavy"}
                </div>
              </div>

              {/* Section for adding notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card for selecting symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
              <CardDescription>Select any symptoms you experienced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {SYMPTOMS.map((symptom) => (
                  <div key={symptom.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`symptom-${symptom.id}`}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      />
                      <Label htmlFor={`symptom-${symptom.id}`}>{symptom.label}</Label>
                    </div>

                    {/* Slider for symptom severity */}
                    {selectedSymptoms.includes(symptom.id) && (
                      <div className="pl-6">
                        <Label className="text-xs text-muted-foreground mb-1 block">Severity</Label>
                        <Slider
                          value={[symptomSeverity[symptom.id] || 3]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => setSymptomSeverity((prev) => ({ ...prev, [symptom.id]: value[0] }))}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Mild</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card for selecting moods */}
          <Card>
            <CardHeader>
              <CardTitle>Mood</CardTitle>
              <CardDescription>Select any moods you experienced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {MOODS.map((mood) => (
                  <div key={mood.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mood-${mood.id}`}
                        checked={selectedMoods.includes(mood.id)}
                        onCheckedChange={() => handleMoodToggle(mood.id)}
                      />
                      <Label htmlFor={`mood-${mood.id}`}>{mood.label}</Label>
                    </div>

                    {/* Slider for mood intensity */}
                    {selectedMoods.includes(mood.id) && (
                      <div className="pl-6">
                        <Label className="text-xs text-muted-foreground mb-1 block">Intensity</Label>
                        <Slider
                          value={[moodIntensity[mood.id] || 3]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => setMoodIntensity((prev) => ({ ...prev, [mood.id]: value[0] }))}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            <Smile className="h-3 w-3 inline" /> Mild
                          </span>
                          <span>
                            Intense <Frown className="h-3 w-3 inline" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Buttons for canceling or saving the form */}
          <CardFooter className="flex justify-end gap-2 px-0">
            <Button variant="outline" type="button" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Period"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  )
}
