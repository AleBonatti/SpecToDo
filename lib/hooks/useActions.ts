/**
 * useActions Hook
 *
 * Fetches and caches actions for use in forms
 */

import { useState, useEffect, useCallback } from 'react'
import { listActions, type Action } from '@/lib/services/actions'

export function useActions() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listActions()
      setActions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load actions')
      console.error('Error loading actions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActions()
  }, [loadActions])

  return {
    actions,
    loading,
    error,
    refetch: loadActions,
  }
}
