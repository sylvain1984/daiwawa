import { useState } from 'react'
import { hasToken, setToken, pullData } from '../store/gist'

interface Props {
  children: React.ReactNode
}

/** Simple shared-password gate. Enter the same password on each device to sync. */
export default function LoginGate({ children }: Props) {
  const [authed, setAuthed] = useState(hasToken())
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault()
    if (!pw.trim()) return
    setBusy(true)
    setToken(pw)
    try {
      await pullData()
    } catch {
      // ignore network errors; proceed with local data
    }
    setBusy(false)
    setAuthed(true)
  }

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleEnter} className="w-full max-w-xs space-y-5 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-purple-500">带娃</h1>
          <p className="text-xs text-gray-400 mt-2">输入密码进入。和家人用同一个密码即可共享数据。</p>
        </div>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="密码"
          autoFocus
          className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 text-center"
        />
        <button
          type="submit"
          disabled={busy || !pw.trim()}
          className="w-full py-3 text-sm rounded-2xl bg-purple-400 text-white font-medium disabled:opacity-50"
        >
          {busy ? '进入中…' : '进入'}
        </button>
      </form>
    </div>
  )
}
