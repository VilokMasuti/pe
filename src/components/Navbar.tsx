import { Link, useLocation } from "react-router-dom"
import { Calendar, Home, LineChart, Plus, Settings } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/add", icon: Plus, label: "Add" },
  { path: "/stats", icon: LineChart, label: "Stats" },
  { path: "/settings", icon: Settings, label: "Settings" },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background">
      <div className="container flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center py-3",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
