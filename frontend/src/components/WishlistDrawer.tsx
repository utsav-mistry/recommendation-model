import React from 'react';
import { Product } from '../types/ecommerce';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Star, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onClearWishlist: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
  onClearWishlist
}) => {
  if (!isOpen) return null;

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => onAddToCart(item));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#eaeded] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        {/* Wishlist Top Bar */}
        <div className="bg-[#131921] text-white p-4 flex items-center justify-between border-b border-[#232f3e]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-bold text-base">Your Wish List ({wishlistItems.length} items)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
            aria-label="Close wish list"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="bg-white p-8 rounded-md border border-gray-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-8 h-8 stroke-rose-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Wish List is empty</h3>
              <p className="text-xs text-gray-500">
                Click the heart icon on any product in the Amazon catalog to save items for later and train your personal recommendation vectors.
              </p>
              <button
                onClick={onClose}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-semibold text-xs py-2 px-5 rounded-full cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <>
              {/* RecSys note */}
              <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-md text-xs text-amber-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Personalized Training Signals:</strong> Saved items contribute to your active Two-Tower sequence embeddings, prioritizing similar high-density 20-core catalog items.
                </p>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
                {wishlistItems.map((product) => (
                  <div key={product.id} className="p-3.5 flex gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="w-16 h-16 object-contain shrink-0 cursor-pointer p-1 border border-gray-100 rounded"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="text-xs font-semibold text-gray-900 hover:text-[#007185] cursor-pointer line-clamp-2 leading-snug"
                        >
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">by {product.brand}</p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex text-[#de7921]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-[#de7921]'
                                    : 'text-gray-200 fill-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-gray-800">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-gray-900 mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <button
                          onClick={() => onAddToCart(product)}
                          className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-1.5 px-3 rounded-md flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>

                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        {wishlistItems.length > 0 && (
          <div className="bg-white p-4 border-t border-gray-200 shadow-lg space-y-2">
            <button
              onClick={handleMoveAllToCart}
              className="w-full bg-[#db4444] hover:bg-[#c93b3b] text-white font-bold text-xs py-3 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Shopping Cart</span>
            </button>

            <button
              onClick={onClearWishlist}
              className="w-full text-center text-xs text-slate-500 hover:text-rose-600 py-1 transition cursor-pointer"
            >
              Clear entire wish list
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
