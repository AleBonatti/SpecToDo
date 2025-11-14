import { useState, useMemo } from 'react';
import type { Item } from '@/lib/services/items';

export function useItemFilters(allItems: Item[]) {
  const [hideDone, setHideDone] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  // Filter items based on current filter settings
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (hideDone && item.status === 'done') return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.categoryId)
      )
        return false;
      if (selectedPriorities.length > 0) {
        if (!item.priority || !selectedPriorities.includes(item.priority)) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, hideDone, selectedCategories, selectedPriorities]);

  return {
    // Filter state
    hideDone,
    selectedCategories,
    selectedPriorities,

    // Filter setters
    setHideDone,
    setSelectedCategories,
    setSelectedPriorities,

    // Filtered results
    filteredItems,
  };
}
