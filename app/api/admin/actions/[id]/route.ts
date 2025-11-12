/**
 * Admin API - Individual Action Management
 *
 * GET /api/admin/actions/[id] - Get an action (admin only)
 * PATCH /api/admin/actions/[id] - Update an action (admin only)
 * DELETE /api/admin/actions/[id] - Delete an action (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, actions } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/actions/[id]
 * Get an action (admin only)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: actionId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Fetch action from database
    const db = getDb()
    const [action] = await db
      .select()
      .from(actions)
      .where(eq(actions.id, actionId))
      .limit(1)

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(action)
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching action:', error)
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/actions/[id]
 * Update an action (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: actionId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { name, displayOrder } = body as {
      name?: string
      displayOrder?: number
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: sql`NOW()`,
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Action name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (displayOrder !== undefined) {
      updateData.displayOrder = displayOrder
    }

    // Update action in database
    const db = getDb()
    const [updatedAction] = await db
      .update(actions)
      .set(updateData)
      .where(eq(actions.id, actionId))
      .returning()

    if (!updatedAction) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      action: updatedAction,
      message: 'Action updated successfully',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'An action with this name already exists' },
        { status: 409 }
      )
    }

    console.error('Error updating action:', error)
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/actions/[id]
 * Delete an action (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: actionId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Check if action exists
    const db = getDb()
    const [action] = await db
      .select()
      .from(actions)
      .where(eq(actions.id, actionId))
      .limit(1)

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    // Delete action from database (items with this action will have action_id set to null)
    await db
      .delete(actions)
      .where(eq(actions.id, actionId))

    return NextResponse.json({
      success: true,
      message: 'Action deleted successfully',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error deleting action:', error)
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    )
  }
}
