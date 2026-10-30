import React, { useState } from 'react';
import { CartItem, Product } from '../types/ecommerce';
import { 
  X, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { AMAZON_PRODUCTS } from '../data/amazon2023Data';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onSelectProduct,
  onAddToCart
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 35.0;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // Suggested impulse cross-sells not in cart
  const cartAsins = cartItems.map((item) => item.product.asin);
  const impulseRecs = AMAZON_PRODUCTS.filter(
    (p) => !cartAsins.includes(p.asin) && p.price < 60
  ).slice(0, 2);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#eaeded] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
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
              <h3 className="text-xl font-bold text-gray-900">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-600">
                Your order #114-893271-92849 has been sent to fulfillment. Recommender candidate weights have been updated for future session personalization.
              </p>
              <button
                onClick={() => {
                  setOrderComplete(false);
                  onClose();
                }}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-2 rounded-full cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-md border border-gray-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Amazon Cart is empty</h3>
              <p className="text-xs text-gray-500">
                Explore the Amazon 2023 20-core catalog and personalized recommendation rails.
              </p>
              <button
                onClick={onClose}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-semibold text-xs py-2 px-5 rounded-full cursor-pointer"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              <div className="bg-white p-3.5 rounded-md border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {subtotal >= freeShippingThreshold ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> You unlocked FREE One-Day Delivery!
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      Add <strong className="text-rose-700">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> of eligible items for FREE Delivery
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
                      onClick={() => {
                        onSelectProduct(item.product);
                        onClose();
                      }}
                      className="w-16 h-16 object-contain shrink-0 cursor-pointer p-1 border border-gray-100 rounded"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            onSelectProduct(item.product);
                            onClose();
                          }}
                          className="text-xs font-semibold text-gray-900 hover:text-[#007185] cursor-pointer line-clamp-2 leading-snug"
                        >
                          {item.product.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">by {item.product.brand}</p>
                        <p className="text-xs font-bold text-gray-900 mt-1">
                          ${item.product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        {/* Qty */}
                        <div className="flex items-center gap-2">
                          <label htmlFor={`cart-qty-${item.product.id}`} className="text-[11px] text-gray-500">Qty:</label>
                          <select
                            id={`cart-qty-${item.product.id}`}
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.product.id, Number(e.target.value))}
                            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-gray-50 cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 10].map((q) => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Impulse Add-on Recommendation */}
              {impulseRecs.length > 0 && (
                <div className="bg-white p-3.5 rounded-md border border-gray-200">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Frequently added with cart items</span>
                  </div>
                  <div className="space-y-2">
                    {impulseRecs.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between text-xs gap-2 pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={rec.image} alt={rec.title} className="w-10 h-10 object-contain shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate text-[11px]">{rec.title}</p>
                            <p className="font-bold text-gray-900">${rec.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart(rec)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Bottom Summary */}
        {!orderComplete && cartItems.length > 0 && (
          <div className="bg-white p-4 border-t border-gray-200 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal ({totalItemCount} items):</span>
              <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>

            <button
              disabled={isCheckingOut}
              onClick={handleCheckout}
              className="w-full bg-[#db4444] hover:bg-[#c93b3b] active:bg-[#b83333] text-white font-bold text-xs py-3 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span>Simulating Checkout & RecSys Attribution...</span>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Amazon 2023 Checkout Simulation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
