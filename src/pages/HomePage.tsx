import { useState } from 'react'
import type { FamilyData } from '../types'
import { useFamilyData } from '../store/useFamily'
import { today, mondayOf, formatDate } from '../utils/date'
import { nanoid } from '../utils/nanoid'
import ChildSection from '../components/ChildSection'
import CheckItem from '../components/CheckItem'
import AddItemSheet from '../components/AddItemSheet'
import type { FieldDef } from '../components/AddItemSheet'

export default function HomePage() {
  const { data, syncing, lastSync, pull, mutate } = useFamilyData()
  const todayStr = today()
  const weekStr = mondayOf()

  const [addHomeworkChild, setAddHomeworkChild] = useState<string | null>(null)

  const sortedChildren = [...data.children].sort((a, b) => a.order - b.order)

  function formatSync(ts: string | null) {
    if (!ts) return '未同步'
    const d = new Date(ts)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m} 同步`
  }

  function toggleHomework(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        homework: d.homework.map((h) =>
          h.id === id
            ? { ...h, done: !h.done, doneAt: !h.done ? now : undefined, updatedAt: now }
            : h
        ),
        meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
      }
    })
  }

  function toggleWeeklyTodo(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        weeklyTodos: d.weeklyTodos.map((t) =>
          t.id === id
            ? { ...t, done: !t.done, doneAt: !t.done ? now : undefined, updatedAt: now }
            : t
        ),
        meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
      }
    })
  }

  function toggleTask(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        assignedTasks: d.assignedTasks.map((t) =>
          t.id === id
            ? { ...t, done: !t.done, doneAt: !t.done ? now : undefined, updatedAt: now }
            : t
        ),
        meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
      }
    })
  }

  const existingSubjects = [...new Set(
    data.homework.map((h) => h.subject).filter(Boolean) as string[]
  )]

  const homeworkFields: FieldDef[] = [
    { key: 'subject', label: '科目', type: 'tagselect', options: existingSubjects },
    { key: 'title', label: '作业内容', type: 'text', required: true },
  ]

  function saveHomework(childId: string, values: Record<string, string>) {
    const now = new Date().toISOString()
    mutate((d: FamilyData) => ({
      ...d,
      homework: [
        ...d.homework,
        {
          id: nanoid(),
          childId,
          date: todayStr,
          subject: values.subject || undefined,
          title: values.title,
          done: false,
          createdBy: 'user',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
    }))
    setAddHomeworkChild(null)
  }

  return (
    <div className="pt-safe-top pb-24 px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">今日</h1>
          <p className="text-xs text-gray-400">{formatDate(todayStr)}</p>
        </div>
        <button
          onClick={pull}
          className="flex items-center gap-1.5 text-xs text-gray-400 active:text-purple-400"
        >
          {syncing ? (
            <span className="inline-block w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>↻</span>
          )}
          <span>{formatSync(lastSync)}</span>
        </button>
      </div>

      {/* Per child */}
      {sortedChildren.map((child) => {
        const childHomework = data.homework.filter(
          (h) => h.childId === child.id && h.date === todayStr
        )
        const childTodos = data.weeklyTodos.filter(
          (t) => t.childId === child.id && t.weekOf === weekStr
        )
        const childTasks = data.assignedTasks.filter((t) => {
          if (t.done) return false
          return t.childId === child.id || !t.childId
        })

        const hasItems = childHomework.length > 0 || childTodos.length > 0 || childTasks.length > 0

        return (
          <ChildSection key={child.id} child={child}>
            {!hasItems && (
              <p className="text-xs text-gray-300 px-4 py-2">今天没有待办 ✨</p>
            )}
            {childHomework.map((h) => (
              <CheckItem
                key={h.id}
                title={h.title}
                subtitle={h.subject ? `${h.subject} · 作业` : '作业'}
                done={h.done}
                onToggle={() => toggleHomework(h.id)}
                accentColor={child.color}
              />
            ))}
            {childTodos.map((t) => (
              <CheckItem
                key={t.id}
                title={t.title}
                subtitle="本周待办"
                done={t.done}
                onToggle={() => toggleWeeklyTodo(t.id)}
                accentColor={child.color}
              />
            ))}
            {childTasks.map((t) => (
              <CheckItem
                key={t.id}
                title={t.title}
                subtitle="任务"
                done={t.done}
                onToggle={() => toggleTask(t.id)}
                accentColor={child.color}
              />
            ))}
            <button
              onClick={() => setAddHomeworkChild(child.id)}
              className="w-full text-left text-xs text-gray-400 px-4 py-2 rounded-xl bg-white/60 border border-dashed border-gray-200 mt-1"
            >
              + 今日作业
            </button>
          </ChildSection>
        )
      })}

      {/* Tasks with no child */}
      {(() => {
        const globalTasks = data.assignedTasks.filter((t) => {
          if (t.done) return false
          if (t.childId) return false
          return true
        })
        if (globalTasks.length === 0) return null
        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 pl-3 py-1" style={{ borderLeft: '4px solid #e5e7eb' }}>
              <span className="font-semibold text-gray-500 text-base">家庭任务</span>
            </div>
            <div className="space-y-1">
              {globalTasks.map((t) => (
                <CheckItem
                  key={t.id}
                  title={t.title}
                  subtitle="任务"
                  done={t.done}
                  onToggle={() => toggleTask(t.id)}
                />
              ))}
            </div>
          </div>
        )
      })()}

      {addHomeworkChild && (
        <AddItemSheet
          title="添加今日作业"
          fields={homeworkFields}
          onSave={(v) => saveHomework(addHomeworkChild, v)}
          onClose={() => setAddHomeworkChild(null)}
        />
      )}
    </div>
  )
}
