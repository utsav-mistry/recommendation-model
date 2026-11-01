import React, { useEffect, useState } from 'react';
import { Product } from '../types/ecommerce';
import { ProductCard } from './ProductCard';
import { 
  X, 
  Star, 
  ShoppingCart, 
  Plus
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  similarProducts?: Product[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onSelectProduct,
  similarProducts = []
}) => {
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [bundleChecked, setBundleChecked] = useState(true);

  useEffect(() => {
    setSelectedImage(product?.image || '');
    setQuantity(1);
    setBundleChecked(true);
  }, [product]);

  if (!product) return null;

  // Find co-purchased item for "Frequently Bought Together" (recommendation signal)
  const coPurchasedProduct = product.inStock
    ? similarProducts.find((p) => p.asin !== product.asin && p.inStock)
    : undefined;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f3f3f3]">
      <div className="bg-white w-full min-h-full overflow-hidden relative animate-in fade-in duration-200">
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
        <div className="p-4 sm:p-6 min-h-[calc(100vh-49px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Image Gallery (5 cols) */}
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
              </div>

              {/* Price Block */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {discountPercent > 0 && (
                    <span className="text-xl font-light text-[#cc0c39]">-{discountPercent}%</span>
                  )}
                  <div className="flex items-start text-gray-900">
                    <span className="text-xs font-bold pt-1">$</span>
                    <span className="text-3xl font-extrabold">
                      {product.inStock ? product.price.toFixed(2) : 'Unavailable'}
                    </span>
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

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  About this item
                </h4>
                {product.features.length > 0 ? (
                  <ul className="space-y-2 text-xs text-gray-700">
                    {product.features.slice(0, 8).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#db4444] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : product.description.length > 0 ? (
                  <div className="space-y-2 text-xs leading-relaxed text-gray-700">
                    {product.description.slice(0, 5).map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No additional product details are available.</p>
                )}
              </div>
            </div>

            {/* Column 3: Buy Box (3 cols) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-md p-4 space-y-3 bg-[#fdfdfd] shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {product.inStock ? `$${product.price.toFixed(2)}` : 'Unavailable'}
                </div>

                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-1 text-[#00a8e1] font-black italic">
                    <span>prime</span>
                    <span className="text-gray-700 font-normal not-italic ml-1">One-Day</span>
                  </div>
                  <p className="text-gray-800">
                    FREE delivery <strong>Tomorrow by 10 PM</strong>
                  </p>
                </div>

                <div className={`pt-1 font-bold text-sm ${product.inStock ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of stock'}
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

                {/* Add to Cart button */}
                <div className="space-y-2 pt-2">
                  <button
                    disabled={!product.inStock}
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="w-full bg-[#db4444] hover:bg-[#c93b3b] text-white font-semibold text-xs py-2.5 px-4 rounded-md shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>

                {/* Details */}
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
                      <span>This item: {product.title.slice(0, 45)}... (<strong>{product.inStock ? `$${product.price.toFixed(2)}` : 'Unavailable'}</strong>)</span>
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

          {/* Section: Customer ratings from the historical Amazon ratings table */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Customer ratings
                </h3>
                <p className="text-xs text-gray-500">
                  Based on the available Amazon star-rating records. Written reviews are not available in this dataset.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full mt-2 sm:mt-0">
                {product.reviewCount.toLocaleString()} ratings
              </span>
            </div>
            <div className="space-y-2 max-w-xl">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = product.ratingDistribution?.[String(stars)] || 0;
                const width = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12">{stars} star</span>
                    <div className="h-2 flex-1 rounded bg-gray-100 overflow-hidden">
                      <div className="h-full bg-[#ffad33]" style={{ width: `${width}%` }} />
                    </div>
                    <span className="w-16 text-right text-gray-500">{count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Similar Products</h3>
            {similarProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {similarProducts.map((similarProduct) => (
                  <ProductCard
                    key={similarProduct.asin}
                    product={similarProduct}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={(item, event) => {
                      event.stopPropagation();
                      onAddToCart(item);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                No similar products are available for this item.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
