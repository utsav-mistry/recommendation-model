import React from 'react';
import { Product } from '../types/ecommerce';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group flex flex-col space-y-3 cursor-pointer select-none"
    >
      {/* Top Image Container with Figma Light Gray Backdrop & Badges */}
      <div className="relative w-full h-56 sm:h-64 bg-[#f5f5f5] rounded-md p-6 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-sm">
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#db4444] text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm shadow-xs z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Top-Right Action Floating Quick View Eye */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-black flex items-center justify-center shadow-xs transition hover:scale-110 cursor-pointer"
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-[#db4444] flex items-center justify-center shadow-xs transition hover:scale-110 cursor-pointer"
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#db4444] text-[#db4444]' : ''}`} />
            </button>
          )}
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {!product.inStock && (
          <span className="absolute left-3 top-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded">
            Out of stock
          </span>
        )}

        {/* Slide-Up Black "Add To Cart" Button (Figma Signature) */}
        <button
          onClick={(e) => onAddToCart(product, e)}
          disabled={!product.inStock}
          className="absolute bottom-0 left-0 right-0 w-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 transition-transform duration-200 cursor-pointer sm:translate-y-full group-hover:translate-y-0 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.inStock ? 'Add To Cart' : 'Out of Stock'}</span>
        </button>
      </div>

      {/* Card Details Below */}
      <div className="space-y-1 pt-1">
        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#db4444] transition-colors truncate">
          {product.title}
        </h4>

        {/* Price Row: Red current price + strikethrough list price */}
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-bold ${product.inStock ? 'text-[#db4444]' : 'text-gray-500'}`}>
            {product.inStock ? `$${product.price.toFixed(2)}` : 'Unavailable'}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-xs font-medium">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex items-center text-xs">
          <div className="flex items-center text-[#ffad33]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-[#ffad33]'
                    : i < product.rating
                    ? 'fill-[#ffad33] opacity-70'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
