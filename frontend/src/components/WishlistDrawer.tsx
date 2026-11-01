import React from 'react';
import { Heart, X, Trash2 } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { ProductCard } from './ProductCard';

interface WishlistDrawerProps {
  isOpen: boolean;
  products: Product[];
  recommendationProducts?: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
  onSelect: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  products,
  recommendationProducts = [],
  onClose,
  onRemove,
  onSelect,
  onSelectProduct,
  onAddToCart
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <aside className="w-full bg-white h-full flex flex-col animate-in fade-in duration-200">
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Heart className="w-5 h-5" /> Wishlist
          </div>
          <button onClick={onClose} aria-label="Close wishlist"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Your Wishlist</h2>
          {!products.length ? (
            <div className="text-center text-sm text-gray-500 py-16">
              Your wishlist is empty.
            </div>
          ) : products.map((product) => (
            <div key={product.asin} className="flex gap-3 border-b border-gray-100 pb-3">
              <img src={product.image} alt={product.title} className="w-16 h-16 object-contain bg-gray-50 rounded" />
              <button onClick={() => { onSelect(product); onClose(); }} className="flex-1 text-left">
                <p className="text-sm font-semibold line-clamp-2">{product.title}</p>
                <p className={`text-sm font-bold ${product.inStock ? 'text-[#db4444]' : 'text-gray-500'}`}>
                  {product.inStock ? `$${product.price.toFixed(2)}` : 'Unavailable'}
                </p>
              </button>
              <button onClick={() => onRemove(product)} aria-label="Remove from wishlist" className="self-center text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          </section>

          {products.length > 0 && (
            <section className="space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">You may also like</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Based on products saved in your wishlist.
                </p>
              </div>
              {recommendationProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendationProducts.map((product) => (
                    <ProductCard
                      key={product.asin}
                      product={product}
                      onSelectProduct={onSelectProduct}
                      onAddToCart={(item, event) => {
                        event.stopPropagation();
                        onAddToCart(item);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No related products are available yet.
                </p>
              )}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};
