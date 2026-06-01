import type { FamilyData, LocalSettings } from '../types'

// Self-hosted sync: same-origin /api/data on the server, guarded by a shared token.
// (Replaces the previous GitHub Gist backend.) Works fully offline when no token is set.
const API = '/api/data'
const SETTINGS_KEY = 'daiwawa_settings'
const CACHE_KEY = 'daiwawa_cache'
const LAST_SYNC_KEY = 'daiwawa_last_sync'

const DEFAULT_FAMILY_DATA: FamilyData = {
  children: [
    { id: 'child-mia', name: 'Mia', color: '#B5A9E0', order: 0 },
    { id: 'child-amy', name: 'Amy', color: '#FFB5C8', order: 1 },
  ],
  weeklyTodos: [],
  homework: [],
  assignedTasks: [],
  meta: { lastUpdatedBy: 'user', lastUpdatedAt: new Date().toISOString() },
}

const ENV = (import.meta as unknown as { env: Record<string, string> }).env
const ENV_TOKEN = ENV.VITE_SYNC_TOKEN

export function loadSettings(): LocalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const s = JSON.parse(raw) as LocalSettings
      if (!s.syncToken && ENV_TOKEN) s.syncToken = ENV_TOKEN
      return s
    }
  } catch {
    // ignore
  }
  return { syncToken: ENV_TOKEN, remindersEnabled: false }
}

export function saveSettings(s: LocalSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

function getToken(): string {
  return (loadSettings().syncToken || '').trim()
}

export function getCachedData(): FamilyData {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw) as FamilyData
  } catch {
    // ignore
  }
  return { ...DEFAULT_FAMILY_DATA }
}

function setCache(data: FamilyData): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
}

/** Fetch latest data. With a token: from the server (404 -> default). Without: from local cache. */
export async function pullData(): Promise<FamilyData> {
  const token = getToken()
  if (!token) return getCachedData()

  const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 404) {
    const data = getCachedData()
    setCache(data)
    return data
  }
  if (!res.ok) throw new Error(`同步拉取失败: ${res.status}`)
  const data = (await res.json()) as FamilyData
  setCache(data)
  return data
}

/** Apply a mutation. With a token: read-latest -> mutate -> push. Without: mutate local cache only. */
export async function mutateData(
  mutator: (data: FamilyData) => FamilyData
): Promise<FamilyData> {
  const token = getToken()
  const latest = await pullData()
  const result = mutator(latest)
  setCache(result)

  if (token) {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    })
    if (!res.ok) throw new Error(`同步推送失败: ${res.status}`)
  }
  return result
}

export function getLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

export { DEFAULT_FAMILY_DATA }
