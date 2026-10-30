import React, { useState, useEffect } from 'react';
import { Product, UserProfile } from '../types/ecommerce';
import { ProductCard } from './ProductCard';
import { 
  Smartphone, 
  Monitor, 
  Watch, 
  Camera, 
  Headphones, 
  Gamepad2, 
  ArrowLeft, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CategoryCardsGridProps {
  products: Product[];
  activeUser: UserProfile;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  wishlistProductIds: string[];
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  compareProductIds: string[];
  onToggleCompare: (product: Product, e: React.MouseEvent) => void;
}

export const CategoryCardsGrid: React.FC<CategoryCardsGridProps> = ({
  products,
  activeUser,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  wishlistProductIds,
  onToggleWishlist,
  compareProductIds,
  onToggleCompare
}) => {
  // Flash Sales Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56
  });

  const [activeCategoryIcon, setActiveCategoryIcon] = useState('Headphones');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = products.filter((p) => p.originalPrice).slice(0, 4);

  const categoryBoxes = [
    { name: 'Phones', icon: Smartphone, targetCategory: 'Electronics' },
    { name: 'Computers', icon: Monitor, targetCategory: 'Computers & Accessories' },
    { name: 'SmartWatch', icon: Watch, targetCategory: 'Wearables' },
    { name: 'Camera', icon: Camera, targetCategory: 'Cameras' },
    { name: 'Headphones', icon: Headphones, targetCategory: 'Audio & Headphones' },
    { name: 'Smart Living', icon: Gamepad2, targetCategory: 'Smart Home' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 space-y-16 py-8">
      {/* SECTION 1: Flash Sales with Live Countdown Timer */}
      <section className="space-y-6">
        {/* Section Header with Figma Red Pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-5 h-10 bg-[#db4444] rounded-sm inline-block" />
              <span className="text-sm font-bold text-[#db4444]">Today's</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Flash Sales
              </h3>

              {/* Countdown Timer Block */}
              <div className="flex items-center gap-4 text-center">
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase block">Days</span>
                  <span className="text-xl sm:text-2xl font-black text-black">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xl font-bold text-[#db4444]">:</span>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase block">Hours</span>
                  <span className="text-xl sm:text-2xl font-black text-black">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xl font-bold text-[#db4444]">:</span>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase block">Minutes</span>
                  <span className="text-xl sm:text-2xl font-black text-black">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xl font-bold text-[#db4444]">:</span>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase block">Seconds</span>
                  <span className="text-xl sm:text-2xl font-black text-black">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              isWishlisted={wishlistProductIds.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
              isCompared={compareProductIds.includes(p.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => onSelectCategory('All Departments')}
            className="bg-[#db4444] hover:bg-[#c93b3b] text-white font-medium text-xs sm:text-sm px-10 py-3.5 rounded-sm transition cursor-pointer shadow-xs"
          >
            View All Products
          </button>
        </div>
      </section>

      {/* Horizontal Divider */}
      <hr className="border-gray-200" />

      {/* SECTION 2: Browse By Category */}
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
