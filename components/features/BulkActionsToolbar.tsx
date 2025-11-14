'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Trash2, FolderTree, X, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Dialog from '@/components/ui/Dialog';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClose: () => void;
  onMarkAsDone: () => Promise<void>;
  onDelete: () => Promise<void>;
  onChangeCategory: (categoryId: string) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
}

export default function BulkActionsToolbar({
  selectedCount,
  onClose,
  onMarkAsDone,
  onDelete,
  onChangeCategory,
  categories,
}: BulkActionsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleMarkAsDone = async () => {
    try {
      setIsMarkingDone(true);
      await onMarkAsDone();
    } finally {
      setIsMarkingDone(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeCategory = async () => {
    if (!selectedCategory) return;

    try {
      setIsChangingCategory(true);
      await onChangeCategory(selectedCategory);
      setShowCategorySelect(false);
      setSelectedCategory('');
    } finally {
      setIsChangingCategory(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {/* Selected count */}
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {selectedCount} selected
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsDone}
                loading={isMarkingDone}
                disabled={isMarkingDone}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Mark as Done</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategorySelect(true)}
                disabled={isChangingCategory}
              >
                <FolderTree className="h-4 w-4" />
                <span className="hidden sm:inline">Change Category</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close bulk actions"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Selected Items"
        description={`Are you sure you want to delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        type="warning"
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Category selection dialog */}
      <Dialog
        open={showCategorySelect}
        onClose={() => {
          setShowCategorySelect(false);
          setSelectedCategory('');
        }}
        onConfirm={() => {
          if (selectedCategory && !isChangingCategory) {
            handleChangeCategory();
          }
        }}
        title="Change Category"
        description={`Select a new category for ${selectedCount} item${selectedCount > 1 ? 's' : ''}.`}
        confirmText="Change Category"
        confirmVariant="primary"
      >
        <Select
          label="New Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={[
            { value: '', label: 'Select a category...' },
            ...categories,
          ]}
          required
          fullWidth
        />
      </Dialog>
    </>
  );
}
