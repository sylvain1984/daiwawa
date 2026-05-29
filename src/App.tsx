import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import HomeworkPage from './pages/HomeworkPage'
import WeeklyPage from './pages/WeeklyPage'
import AssignedPage from './pages/AssignedPage'
import SettingsPage from './pages/SettingsPage'
import { loadSettings } from './store/gist'

export type PageType = 'home' | 'homework' | 'weekly' | 'assigned' | 'settings'

export default function App() {
  const [page, setPage] = useState<PageType>('home')

  useEffect(() => {
    const settings = loadSettings()
    if (!settings.gistId) {
      setPage('settings')
    }
  }, [])

  function renderPage() {
    switch (page) {
      case 'home': return <HomePage />
      case 'homework': return <HomeworkPage />
      case 'weekly': return <WeeklyPage />
      case 'assigned': return <AssignedPage />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>{renderPage()}</main>
      <BottomNav current={page} onChange={setPage} />
    </div>
  )
}
