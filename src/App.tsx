import { useState } from 'react'
import BottomNav from './components/BottomNav'
import SyncSettings from './components/SyncSettings'
import HomePage from './pages/HomePage'
import HomeworkPage from './pages/HomeworkPage'
import WeeklyPage from './pages/WeeklyPage'
import AssignedPage from './pages/AssignedPage'

export type PageType = 'home' | 'homework' | 'weekly' | 'assigned'

export default function App() {
  const [page, setPage] = useState<PageType>('home')
  const [showSettings, setShowSettings] = useState(false)

  function renderPage() {
    switch (page) {
      case 'home': return <HomePage />
      case 'homework': return <HomeworkPage />
      case 'weekly': return <WeeklyPage />
      case 'assigned': return <AssignedPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setShowSettings(true)}
        aria-label="同步设置"
        className="fixed top-safe-top right-4 z-40 mt-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm text-gray-500 active:scale-95"
      >
        ⚙
      </button>
      <main>{renderPage()}</main>
      <BottomNav current={page} onChange={setPage} />
      {showSettings && <SyncSettings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
