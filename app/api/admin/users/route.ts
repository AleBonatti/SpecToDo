/**
 * Admin API - Users Management
 *
 * GET /api/admin/users - List all users with their roles (admin only)
 * POST /api/admin/users - Create a new user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, userRoles } from '@/lib/db'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/auth'

/**
 * GET /api/admin/users
 * List all users with their roles (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Fetch all user roles from database
    const db = getDb()
    const roles = await db
      .select()
      .from(userRoles)
      .orderBy(userRoles.createdAt)

    // For each user, try to get email from Supabase Auth
    const supabase = await createClient()
    const usersWithEmails = await Promise.all(
      roles.map(async (role) => {
        try {
          const { data } = await supabase.auth.admin.getUserById(role.userId)
          return {
            ...role,
            email: data.user?.email,
          }
        } catch {
          // If we can't get email (no service role), just return role data
          return role
        }
      })
    )

    return NextResponse.json({
      users: usersWithEmails,
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { email, password, role = 'user' } = body as {
      email: string
      password: string
      role?: UserRole
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth using admin API
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user in auth' },
        { status: 400 }
      )
    }

    // Create user role in database
    const db = getDb()
    const [userRole] = await db
      .insert(userRoles)
      .values({
        userId: authData.user.id,
        role: role,
      })
      .returning()

    return NextResponse.json(
      {
        user: {
          ...userRole,
          email: authData.user.email,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
