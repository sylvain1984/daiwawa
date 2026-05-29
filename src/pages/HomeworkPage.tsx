import { useState } from 'react'
import type { FamilyData } from '../types'
import { useFamilyData } from '../store/useFamily'
import { loadSettings } from '../store/gist'
import { today, addDays, formatDate } from '../utils/date'
import { nanoid } from '../utils/nanoid'
import ChildSection from '../components/ChildSection'
import CheckItem from '../components/CheckItem'
import AddItemSheet from '../components/AddItemSheet'
import type { FieldDef } from '../components/AddItemSheet'

export default function HomeworkPage() {
  const { data, mutate } = useFamilyData()
  const settings = loadSettings()
  const role = settings.role
  const [dateStr, setDateStr] = useState(() => today())
  const [addForChild, setAddForChild] = useState<string | null>(null)

  const sortedChildren = [...data.children].sort((a, b) => a.order - b.order)

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
        meta: { lastUpdatedBy: role, lastUpdatedAt: now },
      }
    })
  }

  function deleteHomework(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        homework: d.homework.filter((h) => h.id !== id),
        meta: { lastUpdatedBy: role, lastUpdatedAt: now },
      }
    })
  }

  const fields: FieldDef[] = [
    { key: 'subject', label: '科目', type: 'text' },
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
          date: dateStr,
          subject: values.subject || undefined,
          title: values.title,
          done: false,
          createdBy: role,
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { lastUpdatedBy: role, lastUpdatedAt: now },
    }))
    setAddForChild(null)
  }

  return (
    <div className="pt-safe-top pb-24 px-4">
      {/* Header + date nav */}
      <div className="flex items-center justify-between py-3">
        <h1 className="text-lg font-bold text-gray-800">作业</h1>
      </div>
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-2 shadow-sm">
        <button
          onClick={() => setDateStr(addDays(dateStr, -1))}
          className="text-gray-400 px-2 py-1 text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-700">{formatDate(dateStr)}</span>
        <button
          onClick={() => setDateStr(addDays(dateStr, 1))}
          className="text-gray-400 px-2 py-1 text-lg"
        >
          ›
        </button>
      </div>

      {sortedChildren.map((child) => {
        const items = data.homework.filter(
          (h) => h.childId === child.id && h.date === dateStr
        )
        return (
          <ChildSection key={child.id} child={child}>
            {items.length === 0 && (
              <p className="text-xs text-gray-300 px-4 py-2">当天没有作业 ✨</p>
            )}
            {items.map((h) => (
              <CheckItem
                key={h.id}
                title={h.title}
                subtitle={h.subject}
                done={h.done}
                onToggle={() => toggleHomework(h.id)}
                onDelete={role === 'mom' ? () => deleteHomework(h.id) : undefined}
                accentColor={child.color}
              />
            ))}
            {role === 'mom' && (
              <button
                onClick={() => setAddForChild(child.id)}
                className="w-full text-left text-xs text-gray-400 px-4 py-2 rounded-xl bg-white/60 border border-dashed border-gray-200 mt-1"
              >
                + 添加作业
              </button>
            )}
          </ChildSection>
        )
      })}

      {addForChild && (
        <AddItemSheet
          title="添加作业"
          fields={fields}
          onSave={(v) => saveHomework(addForChild, v)}
          onClose={() => setAddForChild(null)}
        />
      )}
    </div>
  )
}
