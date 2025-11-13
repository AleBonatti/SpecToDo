'use client';

/**
 * Admin Actions Management Page
 *
 * Displays a table of all actions with CRUD operations.
 * Only accessible to admin users.
 */

import { useState } from 'react';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import type {
  AdminAction,
  CreateActionInput,
} from '@/lib/services/admin-actions';

export default function AdminActionsPage() {
  const {
    actions,
    isLoading,
    error,
    createNewAction,
    updateAction,
    removeAction,
  } = useAdminActions();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<AdminAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormDisplayOrder('0');
    setEditingAction(null);
  };

  // Open modal for adding new action
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing action
  const openEditModal = (action: AdminAction) => {
    setEditingAction(action);
    setFormName(action.name);
    setFormDisplayOrder(action.displayOrder.toString());
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formName.trim()) return;

    try {
      setIsSubmitting(true);

      if (editingAction) {
        // Update existing action
        await updateAction(editingAction.id, {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        });
      } else {
        // Create new action
        const input: CreateActionInput = {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        };
        await createNewAction(input);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (actionId: string) => {
    try {
      await removeAction(actionId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete action:', err);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Action Management
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage actions that can be associated with items (e.g.,
            &quot;watch&quot;, &quot;listen to&quot;, &quot;visit&quot;)
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-danger-50 border border-danger-200 p-4 text-danger-800 dark:bg-danger-950 dark:border-danger-800 dark:text-danger-200">
            <p className="font-semibold">Error: {error}</p>
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
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Display Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-900">
                  {actions.map((action) => (
                    <tr
                      key={action.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {action.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {action.displayOrder}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
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
                              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:text-danger-400 dark:hover:text-danger-300 dark:hover:bg-danger-950"
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

            <p className="text-xs text-neutral-500">
              Lower numbers appear first. Actions will be used to describe what
              to do with items.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button
              variant="ghost"
              onClick={closeModal}
              disabled={isSubmitting}
            >
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
  );
}
