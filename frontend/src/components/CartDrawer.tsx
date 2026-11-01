import React, { useState } from 'react';
import { CartItem, Product } from '../types/ecommerce';
import { 
  X, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  Sparkles,
  Heart
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onClearCart?: () => void;
  onCheckout: () => Promise<void>;
  recommendationProducts?: Product[];
  isWishlisted?: (product: Product) => boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onSelectProduct,
  onAddToCart,
  onClearCart,
  onCheckout,
  recommendationProducts = [],
  isWishlisted,
  onToggleWishlist
}) => {
  const [orderComplete, setOrderComplete] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 50.0;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // Suggested impulse cross-sells not in cart (recommendation signal)
  const cartAsins = cartItems.map((item) => item.product.asin);
  const impulseRecs = recommendationProducts
    .filter((p) => !cartAsins.includes(p.asin))
    .slice(0, 10);

  const handleCheckout = async () => {
    setCheckoutPending(true);
    try {
      await onCheckout();
      setOrderComplete(true);
    } finally {
      setCheckoutPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#eaeded]">
      <div className="w-full bg-[#eaeded] h-full flex flex-col justify-between animate-in fade-in duration-200">
        {/* Cart Top Bar */}
        <div className="bg-[#131921] text-white p-4 flex items-center justify-between border-b border-[#232f3e]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base">Shopping Cart ({totalItemCount} items)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderComplete ? (
            <div className="bg-white p-6 rounded-md border border-gray-200 text-center space-y-4 my-8">
              <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900">Cart Processed!</h3>
              <p className="text-xs text-gray-600">
                Your selected items have been reserved in the session.
              </p>
              <button
                onClick={() => {
                  setOrderComplete(false);
                  onClose();
                }}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-2.5 rounded-full cursor-pointer shadow-xs"
              >
                Continue Browsing Recommendations
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-md border border-gray-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Cart is empty</h3>
              <p className="text-xs text-gray-500">
                Explore the Amazon 2023 catalog and personalized recommendation rails.
              </p>
              <button
                onClick={onClose}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-semibold text-xs py-2 px-5 rounded-full cursor-pointer"
              >
                Browse Recommendations
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              <div className="bg-white p-3.5 rounded-md border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {subtotal >= freeShippingThreshold ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> You unlocked FREE Delivery!
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      Add <strong className="text-rose-700">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> for FREE Delivery
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="p-3.5 flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-16 h-16 object-contain bg-[#f5f5f5] rounded p-1 cursor-pointer shrink-0"
                      onClick={() => {
                        onSelectProduct(item.product);
                        onClose();
                      }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4
                        onClick={() => {
                          onSelectProduct(item.product);
                          onClose();
                        }}
                        className="text-xs font-semibold text-gray-900 hover:text-[#db4444] cursor-pointer line-clamp-2 leading-tight"
                      >
                        {item.product.title}
                      </h4>
                      <p className="text-[11px] text-gray-500">{item.product.category}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {onToggleWishlist && (
                          <button
                            onClick={() => onToggleWishlist(item.product)}
                            className="text-gray-400 hover:text-[#db4444] p-1 cursor-pointer"
                            title={isWishlisted?.(item.product) ? 'Remove from wishlist' : 'Add to wishlist'}
                            aria-label={isWishlisted?.(item.product) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted?.(item.product) ? 'fill-[#db4444] text-[#db4444]' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Impulse Cross-Sell Recommendations */}
              {impulseRecs.length > 0 && (
                <div className="bg-white p-3.5 rounded-md border border-gray-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Frequently Added Together</span>
                  </div>
                  <div className="space-y-2">
                    {impulseRecs.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between gap-2 p-2 bg-[#f8f9fa] rounded text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={rec.image} alt={rec.title} className="w-8 h-8 object-contain rounded" />
                          <div className="truncate">
                            <p className="font-medium text-gray-900 truncate">{rec.title}</p>
                            <p className="text-[11px] font-bold text-[#b12704]">${rec.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart(rec)}
                          disabled={!rec.inStock}
                          className="shrink-0 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {rec.inStock ? '+ Add' : 'Out of stock'}
                        </button>
                        {onToggleWishlist && (
                          <button
                            onClick={() => onToggleWishlist(rec)}
                            className="shrink-0 text-gray-400 hover:text-[#db4444] p-1 cursor-pointer"
                            title={isWishlisted?.(rec) ? 'Remove from wishlist' : 'Add to wishlist'}
                            aria-label={isWishlisted?.(rec) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted?.(rec) ? 'fill-[#db4444] text-[#db4444]' : ''}`} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Bottom Summary */}
        {cartItems.length > 0 && !orderComplete && (
          <div className="bg-white p-4 border-t border-gray-200 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal ({totalItemCount} items):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Estimated Shipping:</span>
                <span>{subtotal >= freeShippingThreshold ? 'FREE' : '$9.99'}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total:</span>
                <span className="text-base text-[#b12704]">
                  ${(subtotal + (subtotal >= freeShippingThreshold ? 0 : 9.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => void handleCheckout()}
              disabled={checkoutPending}
              className="w-full bg-[#db4444] hover:bg-[#c93b3b] active:bg-[#b83333] text-white font-bold text-xs py-3 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{checkoutPending ? 'Processing...' : 'Complete simulated checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Cart Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
