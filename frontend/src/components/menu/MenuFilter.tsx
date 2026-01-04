'use client';

/**
 * Menu Filter Component
 * کامپوننت فیلتر منو
 */

import { Coffee, Sun, Moon } from 'lucide-react';
import { mealTypeLabels } from '@/utils/format';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MenuFilterProps {
  selectedMealType: MealType | 'all';
  onMealTypeChange: (type: MealType | 'all') => void;
}

const mealTypeIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <Sun className="h-4 w-4" />,
  dinner: <Moon className="h-4 w-4" />,
};

export function MenuFilter({ selectedMealType, onMealTypeChange }: MenuFilterProps) {
  const mealTypes: Array<{ value: MealType | 'all'; label: string; icon?: React.ReactNode }> = [
    { value: 'all', label: 'همه' },
    { value: 'breakfast', label: mealTypeLabels.breakfast, icon: mealTypeIcons.breakfast },
    { value: 'lunch', label: mealTypeLabels.lunch, icon: mealTypeIcons.lunch },
    { value: 'dinner', label: mealTypeLabels.dinner, icon: mealTypeIcons.dinner },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {mealTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onMealTypeChange(type.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMealType === type.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {type.icon}
          {type.label}
        </button>
      ))}
    </div>
  );
}

export default MenuFilter;
