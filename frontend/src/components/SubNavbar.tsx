import React from 'react';

interface SubNavbarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories?: Array<{ name: string; label: string; product_count: number }>;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = []
}) => {
  const departments = [
    { name: 'All Departments', label: 'All Departments' },
    ...categories.map((category) => ({ name: category.name, label: category.label }))
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs select-none">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Horizontal Category Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {departments.map((dept) => {
            const isSelected = selectedCategory === dept.name;
            return (
              <button
                key={dept.name}
                onClick={() => onSelectCategory(dept.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
