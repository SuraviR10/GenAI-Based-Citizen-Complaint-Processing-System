import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryLabel, getPriorityLabel, getStatusLabel } from '../../lib/i18n';

export interface IssueFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

import { MYSORE_AREAS } from '../../lib/types';

const AREA_OPTIONS = [
  { value: 'all', label: 'All Localities in Mysuru' },
  ...MYSORE_AREAS.map((a) => ({ value: a, label: `${a}, Mysuru` }))
];

export const IssueFilterBar: React.FC<IssueFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  area,
  onAreaChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  sort,
  onSortChange
}) => {
  const { language, t } = useLanguage();

  const CATEGORY_OPTIONS = [
    { value: 'all', label: t.allCategoriesFilter },
    { value: 'Roads & Footpaths', label: getCategoryLabel('Roads & Footpaths', language) },
    { value: 'Water & Sewage', label: getCategoryLabel('Water & Sewage', language) },
    { value: 'Street Lighting', label: getCategoryLabel('Street Lighting', language) },
    { value: 'Garbage & Sanitation', label: getCategoryLabel('Garbage & Sanitation', language) },
    { value: 'Public Safety & Hazards', label: getCategoryLabel('Public Safety & Hazards', language) },
    { value: 'Parks & Environment', label: getCategoryLabel('Parks & Environment', language) }
  ];

  const PRIORITY_OPTIONS = [
    { value: 'all', label: t.allPrioritiesFilter },
    { value: 'critical', label: getPriorityLabel('critical', language) },
    { value: 'high', label: getPriorityLabel('high', language) },
    { value: 'medium', label: getPriorityLabel('medium', language) },
    { value: 'low', label: getPriorityLabel('low', language) }
  ];

  const STATUS_OPTIONS = [
    { value: 'all', label: t.allStatusesFilter },
    { value: 'reported', label: getStatusLabel('reported', language) },
    { value: 'reviewed', label: getStatusLabel('reviewed', language) },
    { value: 'assigned', label: getStatusLabel('assigned', language) },
    { value: 'in_progress', label: getStatusLabel('in_progress', language) },
    { value: 'completed', label: getStatusLabel('completed', language) }
  ];

  const SORT_OPTIONS = [
    { value: 'newest', label: t.sortNewest },
    { value: 'priority', label: t.sortPriority },
    { value: 'oldest', label: t.sortOldest }
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* Search Input */}
      <div>
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>

      {/* Filter Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        />

        <Select
          options={AREA_OPTIONS}
          value={area}
          onChange={(e) => onAreaChange(e.target.value)}
        />

        <Select
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        />

        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        />

        <Select
          options={SORT_OPTIONS}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        />
      </div>
    </div>
  );
};
