/**
 * Actions Service (User-facing)
 *
 * Provides read-only access to actions for regular users
 */

export interface Action {
  id: string
  name: string
  displayOrder: number
}

/**
 * Transform API response to domain action
 */
function transformApiAction(apiAction: any): Action {
  return {
    id: apiAction.id,
    name: apiAction.name,
    displayOrder: apiAction.displayOrder || apiAction.display_order || 0,
  }
}

/**
 * List all actions
 */
export async function listActions(): Promise<Action[]> {
  const response = await fetch('/api/actions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch actions' }))
    throw new Error(error.error || 'Failed to fetch actions')
  }

  const data = await response.json()

  // The API might return { actions: [...] } or just [...]
  const actions = data.actions || data

  return actions.map(transformApiAction)
}
