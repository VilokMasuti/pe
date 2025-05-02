import Layout from "./components/Layout"
import { Toaster } from "./components/ui/toaster"
import Addperiod from "./pages/Add-period"
import Calendar from "./pages/Calendar"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"
import Stats from "./pages/Stats"
import { Routes, Route } from "react-router-dom"
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="add" element={<Addperiod />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
