import type { PageType } from '../App'

interface Props {
  current: PageType
  onChange: (p: PageType) => void
}

const TABS: { id: PageType; label: string; icon: string }[] = [
  { id: 'home', label: '今日', icon: '☀️' },
  { id: 'homework', label: '作业', icon: '📚' },
  { id: 'weekly', label: '本周', icon: '📋' },
  { id: 'assigned', label: '任务', icon: '✅' },
]

export default function BottomNav({ current, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="flex">
        {TABS.map((tab) => {
          const active = current === tab.id
          return (
            <button
              key={tab.id}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors"
              style={{ color: active ? '#9b8ec4' : '#9ca3af' }}
              onClick={() => onChange(tab.id)}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
