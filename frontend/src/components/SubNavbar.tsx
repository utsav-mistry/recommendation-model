import React from 'react';
import { Zap, Sparkles, Layers, Sliders } from 'lucide-react';
import { RecEngineMode } from '../types/ecommerce';

interface SubNavbarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  recMode: RecEngineMode;
  onSelectRecMode: (mode: RecEngineMode) => void;
  onOpenArchitecture: () => void;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  recMode,
  onSelectRecMode,
  onOpenArchitecture
}) => {
  const departments = [
    'All Departments',
    'Audio & Headphones',
    'Computers & Accessories',
    'Electronics',
    'Smart Home',
    'Cameras',
    'Wearables'
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs select-none">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Horizontal Category Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {departments.map((dept) => {
            const isSelected = selectedCategory === dept;
            return (
              <button
                key={dept}
                onClick={() => onSelectCategory(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Serving Mode Selector */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-[#f5f5f5] px-3 py-1.5 rounded-full border border-gray-200 text-xs">
            <Zap className="w-3.5 h-3.5 text-[#db4444]" />
            <span className="text-gray-500 font-medium">Rec Engine:</span>
            <select
              value={recMode}
              onChange={(e) => onSelectRecMode(e.target.value as RecEngineMode)}
              className="bg-transparent text-gray-900 font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="two-tower">Two-Tower DSSM (ANN)</option>
              <option value="collaborative-filtering">20-Core Collab Filter</option>
              <option value="hybrid-graph">Hybrid Semantic + Graph</option>
              <option value="popular-baseline">Popularity Baseline</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
