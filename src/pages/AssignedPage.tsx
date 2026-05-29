import { useState } from 'react'
import type { FamilyData } from '../types'
import { useFamilyData } from '../store/useFamily'
import { loadSettings } from '../store/gist'
import { today, addDays } from '../utils/date'
import { nanoid } from '../utils/nanoid'
import CheckItem from '../components/CheckItem'
import AddItemSheet from '../components/AddItemSheet'
import type { FieldDef } from '../components/AddItemSheet'

export default function AssignedPage() {
  const { data, mutate } = useFamilyData()
  const settings = loadSettings()
  const role = settings.role
  const [showAdd, setShowAdd] = useState(false)

  const sevenDaysAgo = addDays(today(), -7)

  const allTasks = role === 'mom'
    ? data.assignedTasks
    : data.assignedTasks.filter((t) => t.assignee === 'dad')

  const pending = allTasks.filter((t) => !t.done)
  const done = allTasks.filter(
    (t) => t.done && t.doneAt && t.doneAt >= sevenDaysAgo
  )

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
        meta: { lastUpdatedBy: role, lastUpdatedAt: now },
      }
    })
  }

  function deleteTask(id: string) {
    mutate((d: FamilyData) => {
      const now = new Date().toISOString()
      return {
        ...d,
        assignedTasks: d.assignedTasks.filter((t) => t.id !== id),
        meta: { lastUpdatedBy: role, lastUpdatedAt: now },
      }
    })
  }

  const childOptions = data.children.map((c) => c.name)

  const addFields: FieldDef[] = [
    { key: 'title', label: '任务内容', type: 'text', required: true },
    { key: 'assignee', label: '分配给', type: 'select', options: ['mom', 'dad'], required: true },
    { key: 'childName', label: '关联孩子', type: 'select', options: childOptions },
    { key: 'dueDate', label: '截止日期', type: 'date' },
  ]

  function saveTask(values: Record<string, string>) {
    const now = new Date().toISOString()
    const childId = values.childName
      ? data.children.find((c) => c.name === values.childName)?.id
      : undefined
    mutate((d: FamilyData) => ({
      ...d,
      assignedTasks: [
        ...d.assignedTasks,
        {
          id: nanoid(),
          title: values.title,
          childId,
          assignee: (values.assignee as 'dad' | 'mom') ?? 'mom',
          dueDate: values.dueDate || undefined,
          done: false,
          createdBy: role,
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { lastUpdatedBy: role, lastUpdatedAt: now },
    }))
    setShowAdd(false)
  }

  function taskSubtitle(t: { assignee: 'dad' | 'mom'; dueDate?: string; childId?: string }) {
    const parts: string[] = []
    const assigneeLabel = t.assignee === 'dad' ? '爸爸' : '妈妈'
    parts.push(assigneeLabel)
    if (t.childId) {
      const child = data.children.find((c) => c.id === t.childId)
      if (child) parts.push(child.name)
    }
    if (t.dueDate) parts.push(`截止 ${t.dueDate}`)
    return parts.join(' · ')
  }

  return (
    <div className="pt-safe-top pb-24 px-4">
      <div className="flex items-center justify-between py-3">
        <h1 className="text-lg font-bold text-gray-800">任务</h1>
        {role === 'mom' && (
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm font-medium px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: '#9b8ec4' }}
          >
            + 新任务
          </button>
        )}
      </div>

      {/* Pending */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide px-1">待办</p>
        {pending.length === 0 && (
          <p className="text-xs text-gray-300 px-4 py-3 bg-white rounded-xl">没有待办任务 ✨</p>
        )}
        <div className="space-y-1">
          {pending.map((t) => (
            <CheckItem
              key={t.id}
              title={t.title}
              subtitle={taskSubtitle(t)}
              done={t.done}
              onToggle={() => toggleTask(t.id)}
              onDelete={role === 'mom' ? () => deleteTask(t.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide px-1">
            已完成（近7天）
          </p>
          <div className="space-y-1">
            {done.map((t) => (
              <CheckItem
                key={t.id}
                title={t.title}
                subtitle={taskSubtitle(t)}
                done={t.done}
                onToggle={() => toggleTask(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddItemSheet
          title="新建任务"
          fields={addFields}
          onSave={saveTask}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
