'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for managing bulk selection of items
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Clear selection when exiting selection mode
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  // Toggle selection for a single item
  const toggleItemSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Select all items
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, deselectAll, selectAll]);

  // Check if an item is selected
  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    isSelectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    selectedItems,
    allSelected: items.length > 0 && selectedIds.size === items.length,
    someSelected: selectedIds.size > 0 && selectedIds.size < items.length,
    toggleSelectionMode,
    toggleItemSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    clearSelection,
  };
}
