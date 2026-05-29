import { useState, useEffect } from 'react'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'select'
  options?: string[]
  required?: boolean
}

interface Props {
  title: string
  fields: FieldDef[]
  onSave: (values: Record<string, string>) => void
  onClose: () => void
}

export default function AddItemSheet({ title, fields, onSave, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of fields) {
      init[f.key] = f.type === 'select' && f.options?.length ? f.options[0] : ''
    }
    return init
  })

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleSave() {
    for (const f of fields) {
      if (f.required && !values[f.key]) return
    }
    onSave(values)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl px-5 pt-4 pb-8 safe-bottom shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              {f.type === 'select' && f.options ? (
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-purple-300"
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                >
                  {!f.required && <option value="">不指定</option>}
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === 'date' ? 'date' : 'text'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-purple-300"
                  placeholder={f.required ? `请输入${f.label}` : `选填`}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <button
          className="mt-6 w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity active:opacity-80"
          style={{ backgroundColor: '#9b8ec4' }}
          onClick={handleSave}
        >
          保存
        </button>
      </div>
    </div>
  )
}
