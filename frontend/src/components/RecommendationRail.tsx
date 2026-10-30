import React, { useRef } from 'react';
import { Product } from '../types/ecommerce';
import { ProductCard } from './ProductCard';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface RecommendationRailProps {
  title: string;
  subtitle?: string;
  algorithmBadge?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  showRecReason?: boolean;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product, e: React.MouseEvent) => void;
  compareProductIds?: string[];
  onToggleCompare?: (product: Product, e: React.MouseEvent) => void;
}

export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  title,
  subtitle,
  algorithmBadge,
  products,
  onSelectProduct,
  onAddToCart,
  showRecReason = true,
  wishlistProductIds = [],
  onToggleWishlist,
  compareProductIds = [],
  onToggleCompare
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 620;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Figma Section Header with Red Vertical Rectangle Accent */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-5 h-10 bg-[#db4444] rounded-sm inline-block shrink-0" />
            <span className="text-sm font-bold text-[#db4444]">
              {subtitle || 'Recommended'}
            </span>
            {algorithmBadge && (
              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {algorithmBadge}
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            {title}
          </h3>
        </div>

        {/* Circular Arrow Navigation Controls (Figma Style) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleScroll('left')}
            className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-gray-200 text-black flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-gray-200 text-black flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[240px] sm:w-[270px] shrink-0">
            <ProductCard
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              showRecReason={showRecReason}
              isWishlisted={wishlistProductIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              isCompared={compareProductIds.includes(product.id)}
              onToggleCompare={onToggleCompare}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
