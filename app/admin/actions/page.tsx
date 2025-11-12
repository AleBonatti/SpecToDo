'use client'

/**
 * Admin Actions Management Page
 *
 * Displays a table of all actions with CRUD operations.
 * Only accessible to admin users.
 */

import { useState } from 'react'
import { Plus, Edit, Trash2, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Loader from '@/components/ui/Loader'
import EmptyState from '@/components/ui/EmptyState'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import { useAdminActions } from '@/lib/hooks/useAdminActions'
import type { AdminAction, CreateActionInput } from '@/lib/services/admin-actions'

export default function AdminActionsPage() {
  const { actions, isLoading, error, createNewAction, updateAction, removeAction } = useAdminActions()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<AdminAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDisplayOrder, setFormDisplayOrder] = useState('0')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormDisplayOrder('0')
    setEditingAction(null)
  }

  // Open modal for adding new action
  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Open modal for editing existing action
  const openEditModal = (action: AdminAction) => {
    setEditingAction(action)
    setFormName(action.name)
    setFormDisplayOrder(action.displayOrder.toString())
    setIsModalOpen(true)
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formName.trim()) return

    try {
      setIsSubmitting(true)

      if (editingAction) {
        // Update existing action
        await updateAction(editingAction.id, {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        })
      } else {
        // Create new action
        const input: CreateActionInput = {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        }
        await createNewAction(input)
      }
      closeModal()
    } catch (err) {
      console.error('Failed to save action:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (actionId: string) => {
    try {
      await removeAction(actionId)
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete action:', err)
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
      <div className="border-b border-gray-200 bg-white">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold text-gray-900">Action Management</h1>
          <p className="mt-2 text-gray-600">
            Manage actions that can be associated with items (e.g., "watch", "listen to", "visit")
          </p>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Add action button */}
        <div className="mb-6">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Add New Action
          </Button>
        </div>

        {/* Actions table */}
        {actions.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No actions found"
            description="Get started by creating your first action."
            action={{
              label: 'Add New Action',
              onClick: openAddModal,
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Display Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {actions.map((action) => (
                    <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {action.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {action.displayOrder}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(action.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => openEditModal(action)}
                          >
                            Edit
                          </Button>

                          {deleteConfirm === action.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(action.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleteConfirm(action.id)}
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
          title={editingAction ? 'Edit Action' : 'Add New Action'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Action Name"
              type="text"
              placeholder="e.g., watch, listen to, visit"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
            />

            <Input
              label="Display Order"
              type="number"
              placeholder="0"
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(e.target.value)}
              fullWidth
            />

            <p className="text-xs text-gray-500">
              Lower numbers appear first. Actions will be used to describe what to do with items.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              disabled={isSubmitting || !formName.trim()}
              loading={isSubmitting}
            >
              {editingAction ? 'Save Changes' : 'Create Action'}
            </Button>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  )
}
