import type { FamilyData, LocalSettings } from '../types'

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
const ENV_TOKEN = ENV.VITE_GIST_TOKEN
const ENV_GIST_ID = ENV.VITE_GIST_ID

export function loadSettings(): LocalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const s = JSON.parse(raw) as LocalSettings
      if (ENV_TOKEN) s.gistToken = ENV_TOKEN
      if (ENV_GIST_ID) s.gistId = ENV_GIST_ID
      return s
    }
  } catch {
    // ignore
  }
  return { gistToken: ENV_TOKEN, gistId: ENV_GIST_ID, remindersEnabled: false }
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

function getGistHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
}

export async function pullData(): Promise<FamilyData> {
  const settings = loadSettings()
  if (!settings.gistId || !settings.gistToken) {
    throw new Error('未配置 Gist，请先在设置中填写 Token 和 Gist ID')
  }

  const res = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
    headers: getGistHeaders(settings.gistToken),
  })

  if (!res.ok) {
    throw new Error(`Gist 拉取失败: ${res.status} ${res.statusText}`)
  }

  const gist = await res.json() as {
    files: Record<string, { content?: string }>
  }

  const file = gist.files['family-data.json']
  if (!file || !file.content) {
    // File doesn't exist yet, return default
    const data = { ...DEFAULT_FAMILY_DATA }
    setCache(data)
    return data
  }

  const data = JSON.parse(file.content) as FamilyData
  setCache(data)
  return data
}

export async function mutateData(
  mutator: (data: FamilyData) => FamilyData
): Promise<FamilyData> {
  const settings = loadSettings()
  if (!settings.gistId || !settings.gistToken) {
    throw new Error('未配置 Gist，请先在设置中填写 Token 和 Gist ID')
  }

  // Step 1: GET latest
  const latest = await pullData()

  // Step 2: Apply mutator
  const result = mutator(latest)

  // Step 3: PATCH back
  const patchRes = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
    method: 'PATCH',
    headers: getGistHeaders(settings.gistToken),
    body: JSON.stringify({
      files: {
        'family-data.json': {
          content: JSON.stringify(result),
        },
      },
      public: false,
    }),
  })

  if (!patchRes.ok) {
    throw new Error(`Gist 推送失败: ${patchRes.status} ${patchRes.statusText}`)
  }

  // Step 4: Update cache
  setCache(result)
  return result
}

export function getLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

export { DEFAULT_FAMILY_DATA }
