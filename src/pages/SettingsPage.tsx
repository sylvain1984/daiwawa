import { useState } from 'react'
import type { LocalSettings } from '../types'
import { loadSettings, saveSettings, pullData, getCachedData, DEFAULT_FAMILY_DATA } from '../store/gist'
import type { FamilyData } from '../types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<LocalSettings>(() => loadSettings())
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [testOk, setTestOk] = useState(false)

  function update(patch: Partial<LocalSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  async function testConnection() {
    setTesting(true)
    setTestMsg(null)
    try {
      await pullData()
      setTestOk(true)
      setTestMsg('连接成功 ✓')
    } catch (err) {
      setTestOk(false)
      setTestMsg(String(err))
    } finally {
      setTesting(false)
    }
  }

  function exportData() {
    const data = getCachedData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'family-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const parsed = JSON.parse(text) as FamilyData
        localStorage.setItem('daiwawa_cache', JSON.stringify(parsed))
        alert('导入成功，刷新页面生效')
      } catch {
        alert('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const children = getCachedData().children.length > 0
    ? getCachedData().children
    : DEFAULT_FAMILY_DATA.children

  return (
    <div className="pt-safe-top pb-24 px-4 space-y-6">
      <h1 className="text-xl font-bold text-gray-800 pt-2">设置</h1>

      {/* Gist 配置 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Gist 配置</h2>

        <div>
          <label className="block text-xs text-gray-400 mb-1">GitHub Token</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-purple-300"
            placeholder="ghp_xxxxxxxxxxxx"
            value={settings.gistToken ?? ''}
            onChange={(e) => update({ gistToken: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Gist ID</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-purple-300"
            placeholder="留空后自动创建（需先输入 Token）"
            value={settings.gistId ?? ''}
            onChange={(e) => update({ gistId: e.target.value })}
          />
        </div>

        <button
          onClick={testConnection}
          disabled={testing || !settings.gistToken || !settings.gistId}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#9b8ec4' }}
        >
          {testing ? '测试中…' : '测试连接'}
        </button>

        {testMsg && (
          <p className={`text-xs mt-1 ${testOk ? 'text-green-600' : 'text-red-400'}`}>
            {testMsg}
          </p>
        )}
      </section>

      {/* 我是 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">我是</h2>
        <div className="grid grid-cols-2 gap-3">
          {(['mom', 'dad'] as const).map((r) => (
            <button
              key={r}
              onClick={() => update({ role: r })}
              className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                settings.role === r
                  ? 'border-purple-300 text-purple-700 bg-purple-50'
                  : 'border-gray-100 text-gray-500 bg-gray-50'
              }`}
            >
              {r === 'mom' ? '👩 妈妈' : '👨 爸爸'}
            </button>
          ))}
        </div>
      </section>

      {/* 孩子 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">孩子</h2>
        <div className="space-y-3">
          {children.map((child) => (
            <div key={child.id} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: child.color }}
              />
              <p className="text-sm text-gray-700 font-medium">{child.name}</p>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: child.color }}
              >
                {child.color}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 数据 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">数据</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={exportData}
            className="py-2.5 rounded-xl text-sm text-gray-600 bg-gray-50 border border-gray-200 font-medium"
          >
            📤 导出 JSON
          </button>
          <button
            onClick={importData}
            className="py-2.5 rounded-xl text-sm text-gray-600 bg-gray-50 border border-gray-200 font-medium"
          >
            📥 导入 JSON
          </button>
        </div>
      </section>
    </div>
  )
}
