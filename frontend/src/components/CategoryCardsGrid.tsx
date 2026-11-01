import React, { useState } from 'react';
import { 
  Baby,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Car,
  Dumbbell,
  Gamepad2,
  Headphones,
  Home,
  Laptop,
  Monitor,
  Music,
  PawPrint,
  Pill,
  Shirt,
  ShoppingBag,
  Smartphone, 
  Utensils,
  Watch
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryCardsGridProps {
  onSelectCategory: (category: string) => void;
  categories: Array<{ name: string; label: string; product_count: number }>;
}

export const CategoryCardsGrid: React.FC<CategoryCardsGridProps> = ({
  onSelectCategory,
  categories
}) => {
  const [activeCategoryIcon, setActiveCategoryIcon] = useState('Headphones');

  const getCategoryIcon = (category: { name: string; label: string }): LucideIcon => {
    const categoryText = `${category.name} ${category.label}`.toLowerCase();
    if (/beauty|personal care|cosmetic|skin|hair/.test(categoryText)) return ShoppingBag;
    if (/baby|child|kid|toy/.test(categoryText)) return Baby;
    if (/book|literature|magazine/.test(categoryText)) return BookOpen;
    if (/business|office|industrial|professional/.test(categoryText)) return BriefcaseBusiness;
    if (/camera|photo|video/.test(categoryText)) return Camera;
    if (/car|automotive|vehicle|motorcycle/.test(categoryText)) return Car;
    if (/sport|fitness|exercise|outdoor/.test(categoryText)) return Dumbbell;
    if (/game|video game|console/.test(categoryText)) return Gamepad2;
    if (/headphone|audio|music|instrument/.test(categoryText)) return Headphones;
    if (/home|kitchen|furniture|household/.test(categoryText)) return Home;
    if (/computer|laptop|electronics|tablet/.test(categoryText)) return Laptop;
    if (/monitor|television|tv/.test(categoryText)) return Monitor;
    if (/pet|animal/.test(categoryText)) return PawPrint;
    if (/health|medical|vitamin|drug/.test(categoryText)) return Pill;
    if (/fashion|clothing|apparel|shoe|jewelry/.test(categoryText)) return Shirt;
    if (/phone|mobile|cellular/.test(categoryText)) return Smartphone;
    if (/watch|clock/.test(categoryText)) return Watch;
    if (/food|grocery|restaurant|cook/.test(categoryText)) return Utensils;
    if (/instrument|music/.test(categoryText)) return Music;
    return ShoppingBag;
  };

  const categoryBoxes = categories.slice(0, 6).map((category) => ({
    name: category.label,
    icon: getCategoryIcon(category),
    targetCategory: category.name
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-5 h-10 bg-[#db4444] rounded-sm inline-block" />
            <span className="text-sm font-bold text-[#db4444]">Categories</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Browse By Category
          </h3>
        </div>

        {/* Category Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryBoxes.map((box) => {
            const Icon = box.icon;
            const isActive = activeCategoryIcon === box.name;
            return (
              <div
                key={box.name}
                onClick={() => {
                  setActiveCategoryIcon(box.name);
                  onSelectCategory(box.targetCategory);
                }}
                className={`flex flex-col items-center justify-center p-6 rounded-md border transition cursor-pointer group ${
                  isActive
                    ? 'bg-[#db4444] border-[#db4444] text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-800 hover:border-[#db4444] hover:bg-[#db4444] hover:text-white'
                }`}
              >
                <Icon className="w-10 h-10 stroke-[1.5] transition-transform group-hover:scale-110 mb-3" />
                <span className="text-xs sm:text-sm font-medium">{box.name}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
