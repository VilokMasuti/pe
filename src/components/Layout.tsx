import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { ModeToggle } from "./mode-toggle"

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Period Tracker</h1>
          <ModeToggle />
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}
