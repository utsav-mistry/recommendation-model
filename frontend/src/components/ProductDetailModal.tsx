import React, { useState } from 'react';
import { Product } from '../types/ecommerce';
import { 
  X, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  ShoppingCart, 
  ThumbsUp,
  Cpu,
  Plus,
  Heart,
  SlidersHorizontal
} from 'lucide-react';
import { AMAZON_PRODUCTS } from '../data/amazon2023Data';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onSelectProduct,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [bundleChecked, setBundleChecked] = useState(true);

  // Find co-purchased item for "Frequently Bought Together"
  const coPurchasedProduct = AMAZON_PRODUCTS.find((p) =>
    product.coPurchasedAsins.includes(p.asin)
  ) || AMAZON_PRODUCTS.find((p) => p.asin !== product.asin);

  const bundleTotal = coPurchasedProduct && bundleChecked
    ? product.price + coPurchasedProduct.price
    : product.price;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const allImages = [product.image, ...(product.additionalImages || [])];

  const handleAddBundleToCart = () => {
    onAddToCart(product, 1);
    if (coPurchasedProduct && bundleChecked) {
      onAddToCart(coPurchasedProduct, 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl my-auto rounded-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-gray-300">
        {/* Modal Top Bar */}
        <div className="bg-[#f0f2f2] px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
            <span>Amazon 2023 20-Core</span>
            <span>&gt;</span>
            <span className="font-semibold text-gray-800">{product.category}</span>
            <span>&gt;</span>
            <span className="truncate">ASIN: {product.asin}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Image Gallery (4 cols) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
              {/* Thumbnail Strip */}
              <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-visible">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded border p-1 shrink-0 overflow-hidden cursor-pointer transition ${
                      selectedImage === img
                        ? 'border-[#e77600] ring-1 ring-[#e77600]'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 order-1 sm:order-2 flex items-center justify-center bg-white p-4 border border-gray-100 rounded min-h-[300px]">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="max-h-[360px] max-w-full object-contain"
                />
              </div>
            </div>

            {/* Column 2: Product Info & Bullets (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                  {product.title}
                </h1>
                <p className="text-xs text-[#007185] hover:underline cursor-pointer mt-1 font-medium">
                  Brand: {product.brand}
                </p>
              </div>

              {/* Rating info */}
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center text-[#de7921]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#de7921]'
                          : i < product.rating
                          ? 'fill-[#de7921] opacity-70'
                          : 'text-gray-300 fill-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-[#007185] hover:underline cursor-pointer">
                  {product.reviewCount.toLocaleString()} ratings
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                  {product.kCoreInteractionCount} in 20-Core
                </span>
              </div>

              {/* Price Block */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {discountPercent > 0 && (
                    <span className="text-xl font-light text-[#cc0c39]">-{discountPercent}%</span>
                  )}
                  <div className="flex items-start text-gray-900">
                    <span className="text-xs font-bold pt-1">$</span>
                    <span className="text-3xl font-extrabold">{product.price.toFixed(2)}</span>
                  </div>
                </div>
                {product.originalPrice && (
                  <p className="text-xs text-gray-500">
                    Typical price: <span className="line-through">${product.originalPrice.toFixed(2)}</span>
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  Prices include VAT and eligible for FREE One-Day Prime delivery.
                </p>
              </div>

              {/* RecSys Why Recommended Badge */}
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-md p-3 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Recommendation Engine Affinity Diagnostics</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                  {product.recReason}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-amber-800 pt-1 border-t border-amber-200">
                  <span>Cosine Similarity: <strong>{product.twoTowerEmbeddingSimilarity || 0.94}</strong></span>
                  <span>Cluster: <strong>{product.category}</strong></span>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  About this item
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  {product.description.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Amazon Buy Box (3 cols) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-md p-4 space-y-3 bg-[#fdfdfd] shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </div>

                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-1 text-[#00a8e1] font-black italic">
                    <span>prime</span>
                    <span className="text-gray-700 font-normal not-italic ml-1">One-Day</span>
                  </div>
                  <p className="text-gray-800">
                    FREE delivery <strong>Tomorrow by 10 PM</strong>
                  </p>
                  <p className="text-teal-700 font-medium text-xs">
                    Or fastest delivery Today 2 PM - 6 PM
                  </p>
                </div>

                <div className="pt-1 text-emerald-700 font-bold text-sm">
                  In Stock
                </div>

                {/* Quantity selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity-select" className="text-xs text-gray-600">Qty:</label>
                  <select
                    id="quantity-select"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="w-full bg-[#db4444] hover:bg-[#c93b3b] text-white font-semibold text-xs py-2.5 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 px-4 rounded-md shadow-xs transition cursor-pointer"
                  >
                    Buy Now
                  </button>

                  {/* Wishlist & Compare Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onToggleWishlist && (
                      <button
                        onClick={() => onToggleWishlist(product)}
                        className={`w-full py-1.5 px-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isWishlisted
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-500'}`} />
                        <span>{isWishlisted ? 'Saved' : 'Wish List'}</span>
                      </button>
                    )}

                    {onToggleCompare && (
                      <button
                        onClick={() => onToggleCompare(product)}
                        className={`w-full py-1.5 px-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isCompared
                            ? 'bg-amber-50 text-amber-900 border-amber-400'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'Compared' : 'Compare'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Secure transaction */}
                <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Ships from</span>
                    <span className="font-semibold text-gray-800">Amazon.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sold by</span>
                    <span className="font-semibold text-gray-800">{product.brand} Direct</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Returns</span>
                    <span className="text-[#007185]">30-day refund/replacement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Frequently Bought Together (Amazon cross-sell recommendation) */}
          {coPurchasedProduct && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Frequently bought together
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-white p-2 rounded border border-gray-200 flex items-center justify-center shrink-0">
                    <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 shrink-0" />
                  <div
                    onClick={() => onSelectProduct(coPurchasedProduct)}
                    className="w-20 h-20 bg-white p-2 rounded border border-gray-200 flex items-center justify-center shrink-0 cursor-pointer hover:border-amber-400 transition"
                  >
                    <img src={coPurchasedProduct.image} alt={coPurchasedProduct.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={bundleChecked}
                        onChange={(e) => setBundleChecked(e.target.checked)}
                        className="rounded text-amber-500"
                      />
                      <span>This item: {product.title.slice(0, 45)}... (<strong>${product.price.toFixed(2)}</strong>)</span>
                    </label>
                    <p className="text-gray-500 pl-5">
                      + {coPurchasedProduct.title.slice(0, 50)}... (<strong>${coPurchasedProduct.price.toFixed(2)}</strong>)
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                  <div>
                    <span className="text-xs text-gray-500">Total price:</span>
                    <p className="text-lg font-bold text-rose-700">${bundleTotal.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handleAddBundleToCart}
                    className="bg-[#db4444] hover:bg-[#c93b3b] text-white font-semibold text-xs py-2 px-4 rounded-md shadow-xs transition cursor-pointer"
                  >
                    Add both to Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Verified Customer Reviews (Amazon 2023 Schema) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Customer reviews & sentiment analysis
                </h3>
                <p className="text-xs text-gray-500">
                  Extracted from Amazon 2023 20-core verified purchase interaction dataset
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mt-2 sm:mt-0 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Verified Amazon Customers
              </span>
            </div>

            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-4 last:border-none">
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {rev.userName[0]}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{rev.userName}</span>
                    <span className="text-[11px] text-gray-400">({rev.userId})</span>
                  </div>

                  {/* Rating & Title */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center text-[#de7921]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#de7921]' : 'text-gray-200 fill-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">{rev.title}</h5>
                  </div>

                  {/* Date & Verified Purchase */}
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Reviewed on {rev.timestamp}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[#c45500] font-bold">Verified Purchase</span>
                    )}
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      Sentiment: {(rev.sentimentScore * 100).toFixed(0)}% {rev.sentiment}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-gray-800 leading-relaxed mt-2">
                    {rev.text}
                  </p>

                  {/* Helpful count */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                    <span>{rev.helpfulVotes} people found this helpful</span>
                    <button className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-0.5 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      Helpful
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
