'use client'

/**
 * Admin Users Management Page
 *
 * Displays a table of all users with CRUD operations.
 * Only accessible to admin users.
 */

import { useState } from 'react'
import { Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Loader from '@/components/ui/Loader'
import EmptyState from '@/components/ui/EmptyState'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import { useAdminUsers } from '@/lib/hooks/useAdminUsers'
import type { AdminUser, CreateUserInput } from '@/lib/services/admin-users'
import { USER_ROLES, type UserRole } from '@/types/auth'

export default function AdminUsersPage() {
  const { users, isLoading, error, createNewUser, updateUser, removeUser } = useAdminUsers()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<UserRole>(USER_ROLES.USER)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole(USER_ROLES.USER)
    setEditingUser(null)
  }

  // Open modal for adding new user
  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Open modal for editing existing user
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user)
    setFormName(user.fullName || '')
    setFormEmail(user.email || '')
    setFormPassword('') // Password not needed for edit
    setFormRole(user.role)
    setIsModalOpen(true)
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // Handle form submission
  const handleSubmitForm = async () => {
    if (editingUser) {
      // Update existing user (name and role)
      if (!formRole) return

      try {
        setIsSubmitting(true)
        await updateUser(editingUser.id, {
          fullName: formName.trim() || undefined,
          role: formRole
        })
        closeModal()
      } catch (err) {
        console.error('Failed to update user:', err)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Create new user
      if (!formEmail.trim() || !formPassword.trim()) return

      try {
        setIsSubmitting(true)
        const input: CreateUserInput = {
          email: formEmail.trim(),
          password: formPassword.trim(),
          fullName: formName.trim() || undefined,
          role: formRole,
        }
        await createNewUser(input)
        closeModal()
      } catch (err) {
        console.error('Failed to create user:', err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handle delete
  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(true)
      await removeUser(userId)
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">User Management</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage user accounts and roles
          </p>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Add user button */}
        <div className="mb-6">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Add New User
          </Button>
        </div>

        {/* Users table */}
        {users.length === 0 ? (
          <EmptyState
            icon={UserIcon}
            title="No users found"
            description="Get started by creating your first user."
            action={{
              label: 'Add New User',
              onClick: openAddModal,
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-900">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm">
                          {user.fullName && (
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {user.fullName}
                            </div>
                          )}
                          <div className={user.fullName ? "text-neutral-500 dark:text-neutral-400" : "font-medium text-neutral-900 dark:text-neutral-100"}>
                            {user.email || <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">{user.id}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === USER_ROLES.ADMIN
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}
                        >
                          {user.role === USER_ROLES.ADMIN ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>

                          {deleteConfirm === user.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                loading={isDeleting}
                                disabled={isDeleting}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleteConfirm(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={editingUser ? 'Edit User' : 'Add New User'}
          size="md"
        >
          <div className="space-y-4">
            {!editingUser && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  fullWidth
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="user@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  fullWidth
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  fullWidth
                />
              </>
            )}

            {editingUser && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  fullWidth
                />

                <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Email: <span className="font-medium text-neutral-900 dark:text-neutral-100">{editingUser.email || <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">{editingUser.id}</span>}</span>
                  </p>
                </div>
              </>
            )}

            <Select
              label="Role"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
              options={[
                { value: USER_ROLES.USER, label: 'User' },
                { value: USER_ROLES.ADMIN, label: 'Admin' },
              ]}
              required
              fullWidth
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              disabled={
                isSubmitting ||
                (!editingUser && (!formEmail.trim() || !formPassword.trim()))
              }
              loading={isSubmitting}
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  )
}
