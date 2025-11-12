/**
 * Actions API (User-facing)
 *
 * GET /api/actions - List all actions (authenticated users)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, actions } from '@/lib/db'
import { requireAuth, handleAuthError } from '@/lib/auth/middleware'

/**
 * GET /api/actions
 * List all actions (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication (any authenticated user can read actions)
    await requireAuth(request)

    // Fetch all actions from database
    const db = getDb()
    const allActions = await db
      .select({
        id: actions.id,
        name: actions.name,
        displayOrder: actions.displayOrder,
      })
      .from(actions)
      .orderBy(actions.displayOrder, actions.name)

    return NextResponse.json({
      actions: allActions,
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}
