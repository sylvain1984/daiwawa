import type { FamilyData, LocalSettings } from '../types'

// Self-hosted sync: same-origin /api/data on the server. The site is gated by
// HTTP Basic Auth (nginx); nginx also injects the backend Bearer token when it
// proxies /api, so the browser's basic-auth header is the only one we send.
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

export function loadSettings(): LocalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw) as LocalSettings
  } catch {
    // ignore
  }
  return { remindersEnabled: false }
}

export function saveSettings(s: LocalSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
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

/** Fetch latest data from the server (404 -> seed default). Falls back to cache on error. */
export async function pullData(): Promise<FamilyData> {
  const res = await fetch(API)
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

/** read-latest -> mutate -> push back to the server. */
export async function mutateData(
  mutator: (data: FamilyData) => FamilyData
): Promise<FamilyData> {
  const latest = await pullData()
  const result = mutator(latest)
  setCache(result)

  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
  if (!res.ok) throw new Error(`同步推送失败: ${res.status}`)
  return result
}

export function getLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

export { DEFAULT_FAMILY_DATA }
