import { useState } from 'react'
import { loadSettings, saveSettings, getLastSync } from '../store/gist'

interface Props {
  onClose: () => void
}

export default function SyncSettings({ onClose }: Props) {
  const [token, setToken] = useState(loadSettings().syncToken || '')
  const [msg, setMsg] = useState('')

  function fmt(ts: string | null) {
    return ts ? new Date(ts).toLocaleString() : '尚未同步'
  }

  function handleSave() {
    const s = loadSettings()
    saveSettings({ ...s, syncToken: token.trim() })
    setMsg(token.trim() ? '已保存，刷新后生效' : '已清除密钥（仅本地保存）')
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-gray-800">云同步</h2>
          <p className="text-xs text-gray-400 mt-1">在每台设备填入同一个密钥即可同步。留空则只存本机。</p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="同步密钥"
          autoComplete="off"
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <p className="text-xs text-gray-400">上次同步：{fmt(getLastSync())}</p>
        {msg && <p className="text-xs text-purple-500">{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-xl bg-gray-100 text-gray-600">取消</button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm rounded-xl bg-purple-400 text-white">保存</button>
        </div>
      </div>
    </div>
  )
}
