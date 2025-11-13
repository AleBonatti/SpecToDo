'use client';

import React from 'react';
import { ListTodo, CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import type { ItemStats as ItemStatsType } from '@/lib/hooks/useItemStats';

export interface ItemStatsProps {
  stats: ItemStatsType;
}

const ItemStats: React.FC<ItemStatsProps> = ({ stats }) => {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Overview
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={stats.total}
          icon={ListTodo}
          variant="primary"
        />
        <StatCard
          title="Completed"
          value={stats.done}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="To Do"
          value={stats.todo}
          icon={Circle}
          variant="accent"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          variant="neutral"
        />
      </div>
    </div>
  );
};

ItemStats.displayName = 'ItemStats';

export default ItemStats;
