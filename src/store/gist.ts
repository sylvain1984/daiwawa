import type { FamilyData, LocalSettings } from '../types'

// Self-hosted sync: same-origin /api/data on the server, guarded by a shared
// password (the in-app login). The password is sent as the Bearer token and
// also namespaces the stored data. It lives only in this device's localStorage.
const API = '/api/data'
const TOKEN_KEY = 'daiwawa_token'
const SETTINGS_KEY = 'daiwawa_settings'
const CACHE_KEY = 'daiwawa_cache'
const LAST_SYNC_KEY = 'daiwawa_last_sync'

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  const t = token.trim()
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  return !!getToken()
}

function authHeader(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` }
}

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

/** Fetch latest data from the server (404 -> seed default). Falls back to cache without a token. */
export async function pullData(): Promise<FamilyData> {
  if (!hasToken()) return getCachedData()
  const res = await fetch(API, { headers: authHeader() })
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

  if (hasToken()) {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
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
