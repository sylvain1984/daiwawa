import { useState } from 'react'
import type { FamilyData } from '../types'
import { useFamilyData } from '../store/useFamily'
import { mondayOf, addDays, formatWeek, formatDate } from '../utils/date'
import { nanoid } from '../utils/nanoid'
import ChildSection from '../components/ChildSection'
import CheckItem from '../components/CheckItem'
import AddItemSheet from '../components/AddItemSheet'
import type { FieldDef } from '../components/AddItemSheet'

export default function WeeklyPage() {
  const { data, mutate } = useFamilyData()
  const [weekOf, setWeekOf] = useState(() => mondayOf())
  const [addForChild, setAddForChild] = useState<string | null>(null)

  const sortedChildren = [...data.children].sort((a, b) => a.order - b.order)

  const weekEnd = addDays(weekOf, 6)

  function prevWeek() { setWeekOf(addDays(weekOf, -7)) }
  function nextWeek() { setWeekOf(addDays(weekOf, 7)) }

  function toggleTodo(id: string) {
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

  function deleteTodo(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        weeklyTodos: d.weeklyTodos.filter((t) => t.id !== id),
        meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
      }
    })
  }

  const fields: FieldDef[] = [
    { key: 'title', label: '待办内容', type: 'text', required: true },
  ]

  function saveTodo(childId: string, values: Record<string, string>) {
    const now = new Date().toISOString()
    mutate((d: FamilyData) => ({
      ...d,
      weeklyTodos: [
        ...d.weeklyTodos,
        {
          id: nanoid(),
          childId,
          weekOf,
          title: values.title,
          done: false,
          createdBy: 'user',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { lastUpdatedBy: 'user', lastUpdatedAt: now },
    }))
    setAddForChild(null)
  }

  return (
    <div className="pt-safe-top pb-24 px-4">
      <div className="flex items-center justify-between py-3">
        <h1 className="text-lg font-bold text-gray-800">本周</h1>
      </div>

      <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-2 shadow-sm">
        <button onClick={prevWeek} className="text-gray-400 px-2 py-1 text-lg">‹</button>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{formatWeek(weekOf)}</p>
          <p className="text-xs text-gray-400">
            {formatDate(weekOf).split(' ')[0]} – {formatDate(weekEnd).split(' ')[0]}
          </p>
        </div>
        <button onClick={nextWeek} className="text-gray-400 px-2 py-1 text-lg">›</button>
      </div>

      {sortedChildren.map((child) => {
        const items = data.weeklyTodos.filter(
          (t) => t.childId === child.id && t.weekOf === weekOf
        )
        return (
          <ChildSection key={child.id} child={child}>
            {items.length === 0 && (
              <p className="text-xs text-gray-300 px-4 py-2">本周没有待办 ✨</p>
            )}
            {items.map((t) => (
              <CheckItem
                key={t.id}
                title={t.title}
                done={t.done}
                onToggle={() => toggleTodo(t.id)}
                onDelete={() => deleteTodo(t.id)}
                accentColor={child.color}
              />
            ))}
            <button
              onClick={() => setAddForChild(child.id)}
              className="w-full text-left text-xs text-gray-400 px-4 py-2 rounded-xl bg-white/60 border border-dashed border-gray-200 mt-1"
            >
              + 添加本周待办
            </button>
          </ChildSection>
        )
      })}

      {addForChild && (
        <AddItemSheet
          title="添加本周待办"
          fields={fields}
          onSave={(v) => saveTodo(addForChild, v)}
          onClose={() => setAddForChild(null)}
        />
      )}
    </div>
  )
}
