import { useState } from 'react'
import BottomNav from './components/BottomNav'
import LoginGate from './components/LoginGate'
import HomePage from './pages/HomePage'
import HomeworkPage from './pages/HomeworkPage'
import WeeklyPage from './pages/WeeklyPage'
import AssignedPage from './pages/AssignedPage'

export type PageType = 'home' | 'homework' | 'weekly' | 'assigned'

export default function App() {
  const [page, setPage] = useState<PageType>('home')

  function renderPage() {
    switch (page) {
      case 'home': return <HomePage />
      case 'homework': return <HomeworkPage />
      case 'weekly': return <WeeklyPage />
      case 'assigned': return <AssignedPage />
    }
  }

  return (
    <LoginGate>
      <div className="min-h-screen bg-gray-50">
        <main>{renderPage()}</main>
        <BottomNav current={page} onChange={setPage} />
      </div>
    </LoginGate>
  )
}
