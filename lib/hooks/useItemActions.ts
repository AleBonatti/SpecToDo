import { useState } from 'react';
import type { Item } from '@/lib/services/items';

export interface ItemFormData {
  categoryId?: string;
  actionId?: string | null;
  title: string;
  description?: string | null;
  status: 'todo' | 'done';
  priority?: 'low' | 'medium' | 'high' | null;
  url?: string | null;
  location?: string | null;
  note?: string | null;
  targetDate?: string | null;
}

export interface UseItemActionsProps {
  createNewItem: (data: any) => Promise<any>;
  updateExistingItem: (id: string, data: any) => Promise<any>;
  deleteExistingItem: (id: string) => Promise<any>;
  toggleStatus: (id: string) => Promise<any>;
  allItems: Item[];
}

export function useItemActions({
  createNewItem,
  updateExistingItem,
  deleteExistingItem,
  toggleStatus,
  allItems,
}: UseItemActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailPanelItem, setDetailPanelItem] = useState<Item | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'todo' | 'done'>('todo');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  const [formUrl, setFormUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');

  // Reset form
  const resetForm = () => {
    setFormTitle('');
    setFormCategory('');
    setFormAction('');
    setFormDescription('');
    setFormStatus('todo');
    setFormPriority('');
    setFormUrl('');
    setFormLocation('');
    setFormNote('');
    setFormTargetDate('');
    setEditingItem(null);
  };

  // Open modal for adding new item
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
  const openEditModal = (id: string) => {
    const item = allItems.find((i) => i.id === id);
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormCategory(item.categoryId);
      setFormAction(item.actionId || '');
      setFormDescription(item.description || '');
      setFormStatus(item.status);
      setFormPriority(item.priority || '');
      setFormUrl(item.url || '');
      setFormLocation(item.location || '');
      setFormNote(item.note || '');
      setFormTargetDate(item.targetDate || '');
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Submit form (add or edit)
  const handleSubmitForm = async () => {
    if (!formTitle.trim() || !formCategory) return;

    try {
      setIsSubmitting(true);

      if (editingItem) {
        await updateExistingItem(editingItem.id, {
          actionId: formAction || null,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          priority: formPriority || null,
          url: formUrl.trim() || null,
          location: formLocation.trim() || null,
          note: formNote.trim() || null,
          targetDate: formTargetDate || null,
        });
      } else {
        await createNewItem({
          categoryId: formCategory,
          actionId: formAction || null,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          priority: formPriority || null,
          url: formUrl.trim() || null,
          location: formLocation.trim() || null,
          note: formNote.trim() || null,
          targetDate: formTargetDate || null,
        });
      }

      closeModal();
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteExistingItem(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Toggle item status
  const handleToggleDone = async (id: string) => {
    try {
      await toggleStatus(id);
    } catch (err) {
      console.error('Failed to toggle item status:', err);
    }
  };

  // Detail panel handlers
  const handleItemClick = (id: string) => {
    const item = allItems.find((i) => i.id === id);
    if (item) {
      setDetailPanelItem(item);
    }
  };

  const closeDetailPanel = () => {
    setDetailPanelItem(null);
  };

  const handleEditFromPanel = () => {
    if (detailPanelItem) {
      openEditModal(detailPanelItem.id);
      closeDetailPanel();
    }
  };

  const handleDeleteFromPanel = () => {
    if (detailPanelItem) {
      setDeleteConfirm(detailPanelItem.id);
      closeDetailPanel();
    }
  };

  return {
    // Modal state
    isModalOpen,
    editingItem,
    deleteConfirm,
    isSubmitting,
    detailPanelItem,

    // Form state
    formTitle,
    formCategory,
    formAction,
    formDescription,
    formStatus,
    formPriority,
    formUrl,
    formLocation,
    formNote,
    formTargetDate,

    // Form setters
    setFormTitle,
    setFormCategory,
    setFormAction,
    setFormDescription,
    setFormStatus,
    setFormPriority,
    setFormUrl,
    setFormLocation,
    setFormNote,
    setFormTargetDate,

    // Modal actions
    openAddModal,
    openEditModal,
    closeModal,

    // CRUD actions
    handleSubmitForm,
    handleDeleteItem,
    handleToggleDone,

    // Detail panel actions
    handleItemClick,
    closeDetailPanel,
    handleEditFromPanel,
    handleDeleteFromPanel,

    // Delete confirmation
    setDeleteConfirm,
  };
}
