"use client"

import type React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from '../components/ui/button';

type Step = {
  title: string
  description: string
  content: React.ReactNode
}

export function WelcomeGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const steps: Step[] = [
    {
      title: "Welcome to Period Tracker",
      description: "Let's get you started with tracking your cycle",
      content: (
        <div className="text-center space-y-4">
          <p>This app helps you track your periods, predict future cycles, and understand your body better.</p>
          <p className="text-sm text-muted-foreground">Swipe through this guide to learn how to use the app.</p>
        </div>
      ),
    },
    {
      title: "Log Your Period",
      description: "Record your period details",
      content: (
        <div className="text-center space-y-4">
          <p>Tap the "Add" button in the navigation bar to log your period.</p>
          <p className="text-sm text-muted-foreground">
            You can record start date, end date, flow level, symptoms, and moods.
          </p>
        </div>
      ),
    },
    {
      title: "View Your Calendar",
      description: "See your cycle at a glance",
      content: (
        <div className="text-center space-y-4">
          <p>The Calendar page shows your periods and fertile windows.</p>
          <p className="text-sm text-muted-foreground">
            Red dots indicate period days, and pink dots show your fertile window.
          </p>
        </div>
      ),
    },
    {
      title: "Check Your Stats",
      description: "Understand your cycle patterns",
      content: (
        <div className="text-center space-y-4">
          <p>The Stats page shows your cycle length, period duration, and common symptoms.</p>
          <p className="text-sm text-muted-foreground">
            The more data you enter, the more accurate your stats will be.
          </p>
        </div>
      ),
    },
  ]

  if (dismissed) {
    return null
  }

  return (
    <Card className="relative border-primary/20 mb-6">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      <CardHeader>
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].description}</CardDescription>
      </CardHeader>
      <CardContent>{steps[currentStep].content}</CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-primary/20"}`}
            />
          ))}
        </div>
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep((prev) => prev + 1)}>Next</Button>
        ) : (
          <Button onClick={() => setDismissed(true)}>Get Started</Button>
        )}
      </CardFooter>
    </Card>
  )
}
