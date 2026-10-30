import React from 'react';
import { Product } from '../types/ecommerce';
import { ArrowRight, X, SlidersHorizontal, Trash2 } from 'lucide-react';

interface CompareFloatingBarProps {
  compareProducts: Product[];
  onOpenCompareModal: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareProducts,
  onOpenCompareModal,
  onRemoveProduct,
  onClearAll
}) => {
  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#131921] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-5 duration-200 max-w-[95vw]">
      {/* Label and Count */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
          {compareProducts.length}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-bold leading-tight">Compare Specifications</p>
          <p className="text-[11px] text-slate-400 leading-tight">Up to 3 products ({compareProducts.length}/3)</p>
        </div>
      </div>

      {/* Selected Items Thumbnails */}
      <div className="flex items-center gap-2">
        {compareProducts.map((p) => (
          <div key={p.id} className="relative group w-11 h-11 bg-white rounded-lg p-1 border border-slate-700 shrink-0 flex items-center justify-center">
            <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain" />
            <button
              onClick={() => onRemoveProduct(p.id)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer shadow"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        {/* Empty slots indicator */}
        {[...Array(3 - compareProducts.length)].map((_, idx) => (
          <div
            key={idx}
            className="w-11 h-11 rounded-lg border border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs shrink-0"
          >
            +
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCompareModal}
          className="bg-[#db4444] hover:bg-[#c93b3b] text-white font-bold text-xs py-2 px-4 rounded-md shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClearAll}
          className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          title="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
