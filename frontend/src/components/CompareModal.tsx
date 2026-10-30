import React from 'react';
import { Product } from '../types/ecommerce';
import { 
  X, 
  Check, 
  Minus, 
  Star, 
  ShoppingCart, 
  Trash2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareProducts,
  onRemoveProduct,
  onClearAll,
  onAddToCart,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl my-auto rounded-xl shadow-2xl overflow-hidden relative border border-gray-300 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#131921] text-white px-6 py-4 flex items-center justify-between border-b border-[#232f3e]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Product Specification Comparison</h2>
                <span className="text-xs font-semibold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  {compareProducts.length} / 3 Items
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Side-by-side technical specifications, pricing, reviews, and recommendation embeddings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareProducts.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-white transition underline cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Comparison Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {compareProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-base font-semibold text-gray-700">No products selected for comparison</p>
              <p className="text-xs text-gray-500">
                Select up to 3 items using the "Compare" button on any product card in the Amazon catalog.
              </p>
              <button
                onClick={onClose}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-2 px-5 rounded-full cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="w-48 text-left py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/70 align-top">
                      Product
                    </th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="py-4 px-4 text-left align-top min-w-[240px] max-w-[280px]">
                        <div className="relative group flex flex-col justify-between h-full space-y-2">
                          <button
                            onClick={() => onRemoveProduct(p.id)}
                            className="absolute -top-1 -right-1 text-gray-400 hover:text-rose-600 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div 
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="w-full h-36 bg-white p-2 rounded flex items-center justify-center border border-gray-100 cursor-pointer hover:border-amber-400 transition"
                          >
                            <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain" />
                          </div>

                          <h4 
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="text-xs font-semibold text-gray-900 hover:text-[#007185] line-clamp-2 cursor-pointer leading-snug"
                          >
                            {p.title}
                          </h4>

                          <div className="pt-2">
                            <button
                              onClick={() => onAddToCart(p)}
                              className="w-full bg-[#db4444] hover:bg-[#c93b3b] text-white font-semibold text-xs py-2 px-3 rounded-md shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                    {/* Placeholder columns if < 3 */}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <th key={`empty-${i}`} className="py-4 px-4 text-center align-middle min-w-[240px] bg-gray-50/40 border border-dashed border-gray-200 rounded">
                        <div className="py-12 text-gray-400 text-xs">
                          <span>+ Select another item to compare</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs">
                  {/* Price */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Price</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-gray-900">${p.price.toFixed(2)}</span>
                          {p.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ${p.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-price-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* Customer Rating */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Rating & Reviews</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-[#de7921]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(p.rating) ? 'fill-[#de7921]' : 'text-gray-200 fill-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-gray-800">{p.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({p.reviewCount.toLocaleString()})</span>
                        </div>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-rating-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* Prime Delivery */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Prime Delivery</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        {p.isPrime ? (
                          <span className="text-[#00a8e1] font-black italic flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600 not-italic" /> prime One-Day
                          </span>
                        ) : (
                          <span className="text-gray-500">Standard 3-5 days</span>
                        )}
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-prime-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* Brand & ASIN */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Brand & ASIN</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{p.brand}</p>
                        <p className="font-mono text-[11px] text-gray-500">ASIN: {p.asin}</p>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-brand-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Department</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 text-gray-800">
                        {p.category}
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-cat-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* 20-Core Interaction Count */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">20-Core Density</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {p.kCoreInteractionCount} verified interactions
                        </span>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-kcore-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* RecSys Match & Vector Affinity */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Two-Tower Cosine</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold text-amber-800">
                            {p.twoTowerEmbeddingSimilarity ? `${Math.round(p.twoTowerEmbeddingSimilarity * 100)}% match` : '92% match'}
                          </span>
                        </div>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-twotower-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* ReviewStream Sentiment */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">Review Sentiment</td>
                    {compareProducts.map((p) => {
                      const topRev = p.reviews[0];
                      return (
                        <td key={p.id} className="py-3 px-4">
                          {topRev ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              {(topRev.sentimentScore * 100).toFixed(0)}% Positive
                            </span>
                          ) : (
                            <span className="text-gray-400">Neutral</span>
                          )}
                        </td>
                      );
                    })}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-sent-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>

                  {/* Key Features */}
                  <tr>
                    <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70 align-top">Key Features</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 align-top">
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-700">
                          {p.features.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                    {[...Array(3 - compareProducts.length)].map((_, i) => (
                      <td key={`empty-feat-${i}`} className="py-3 px-4 text-gray-300">-</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Specifications standardized from Amazon 2023 20-Core metadata</span>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-1.5 rounded-full cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
