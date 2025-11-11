/**
 * Client-Side Auth Utilities
 *
 * Provides helper functions for checking user roles on the client side.
 */

import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/auth'
import { USER_ROLES } from '@/types/auth'

/**
 * Get the current user's role from the JWT
 * Returns 'user' if no role is found
 */
export async function getUserRole(): Promise<UserRole> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return USER_ROLES.USER
  }

  // Extract role from JWT app_metadata (injected by Custom Access Token Hook)
  return (user.app_metadata?.user_role as UserRole) || USER_ROLES.USER
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === USER_ROLES.ADMIN
}

/**
 * Get the current user's information including role
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: (user.app_metadata?.user_role as UserRole) || USER_ROLES.USER,
  }
}
