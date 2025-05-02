# Period Tracker Application - Technical Report

## Overview

The Period Tracker is a comprehensive web application built with Vite, React, Tailwind CSS v4, and shadcn/UI components. It allows users to track their menstrual cycles, symptoms, moods, and provides predictions for future periods and fertile windows.

## Architecture

The application follows a modern React architecture with the following key components:

### Frontend
- **Framework**: React with Vite for fast development
- **Styling**: Tailwind CSS v4 with shadcn/UI components
- **Routing**: React Router for navigation
- **State Management**: React's built-in useState and useEffect hooks
- **Date Handling**: date-fns for date manipulation
- **Data Visualization**: Recharts for statistics charts

### Backend
- **Database**: Supabase for data storage
- **Authentication**: Not yet implemented, planned for future
- **API**: Supabase client for database operations

## Database Schema

The application uses four main tables in Supabase:

1. **periods**: Stores period information including start date, end date, flow level, and notes
2. **symptoms**: Tracks symptoms associated with periods
3. **moods**: Records mood information during periods
4. **settings**: Stores user preferences like cycle length and notification settings

## Key Features

### Dashboard
- Displays next period prediction
- Shows fertile window
- Presents last period information
- Provides quick access to main functions

### Calendar
- Visual representation of periods and fertile windows
- Interactive date selection
- Highlights period days, fertile window, and ovulation day
- Provides detailed information for selected dates

### Period Logging
- Records period start and end dates
- Tracks flow level
- Logs symptoms with severity levels
- Records moods with intensity levels
- Supports adding notes

### Statistics
- Calculates average cycle length
- Shows shortest and longest cycles
- Displays average period duration
- Visualizes most common symptoms and moods

## Technical Implementation

### Data Flow
1. User inputs period data through the Add Period form
2. Data is stored in Supabase database
3. Application fetches and processes data to generate statistics and predictions
4. UI components display the processed information

### Prediction Algorithm
- Next period prediction uses the average cycle length from settings
- Fertile window calculation is based on the estimated ovulation day
- Ovulation is estimated to occur 14 days before the next period

### UI Components
- Responsive design using Tailwind CSS
- Accessible components from shadcn/UI
- Custom styling for period and fertility indicators
- Dark mode support


### Calendar Page
- Fixed period and fertile day highlighting
- Implemented proper day styling using classNames
- Added date selection functionality
- Improved visual indicators for different types of days
- Added detailed information display for selected dates



### Dark Mode
- Fixed text color issues in dark mode
- Added specific CSS fixes for calendar day styling
- Ensured consistent contrast across the application


## Security Considerations

- Input validation for all user inputs
- Secure database access through Supabase
- Environment variables for sensitive information

## Conclusion

The Period Tracker application provides a comprehensive solution for menstrual cycle tracking with an intuitive user interface and powerful features. The application successfully implements all core functionality while maintaining good performance and user experience.

The fixed issues have significantly improved the application's usability, particularly in the calendar and settings pages. The application is now ready for user testing and further feature development.
