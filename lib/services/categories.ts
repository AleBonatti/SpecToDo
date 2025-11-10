/**
 * Categories Service
 *
 * Provides read operations for categories with Supabase integration.
 * Handles data transformation between database and domain types.
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

// Database types
type DbCategory = Database['public']['Tables']['categories']['Row']

// Domain types
export interface Category {
  id: string
  userId: string
  name: string
  color?: string | null
  icon?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Transform database category to domain category
 */
function transformDbCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    userId: dbCategory.user_id,
    name: dbCategory.name,
    color: dbCategory.color,
    icon: dbCategory.icon,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

/**
 * List all categories for the current user
 */
export async function listCategories(): Promise<Category[]> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return data.map(transformDbCategory)
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string): Promise<Category | null> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch category: ${error.message}`)
  }

  return transformDbCategory(data)
}
