import { useState, useEffect, useCallback } from 'react'
import type { FamilyData } from '../types'
import { getCachedData, pullData, mutateData, getLastSync } from './gist'

export function useFamilyData() {
  const [data, setData] = useState<FamilyData>(() => getCachedData())
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(() => getLastSync())

  const pull = useCallback(async () => {
    setSyncing(true)
    try {
      const fresh = await pullData()
      setData(fresh)
      setLastSync(getLastSync())
    } catch (err) {
      console.error('同步失败:', err)
    } finally {
      setSyncing(false)
    }
  }, [])

  const mutate = useCallback(async (fn: (d: FamilyData) => FamilyData) => {
    setSyncing(true)
    try {
      const result = await mutateData(fn)
      setData(result)
      setLastSync(getLastSync())
    } catch (err) {
      console.error('更新失败:', err)
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    pull()
  }, [pull])

  return { data, syncing, lastSync, pull, mutate }
}
