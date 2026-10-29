import React from 'react';
import { Link } from 'react-router-dom';
import { IProduct } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';

interface ProductCardProps {
  product: IProduct;
  onQuickInquiry?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickInquiry }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: product.minOrderQty || 1,
      image: product.images[0] || '',
      slug: product.slug,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickInquiry) {
      onQuickInquiry(product);
    } else {
      // Default: direct to WhatsApp
      const businessPhone = '2348000000000';
      const msg = `Hello FarmNexa, I am interested in bulk wholesale procurement for: ${product.name} (Origin: ${product.originState}). Please provide FOB/CIF quotation.`;
      window.open(`https://wa.me/${businessPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group border border-outline-variant/30">
      <div>
        {/* Card Stage Image */}
        <Link to={`/product/${product.slug}`} className="block relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Top-Left Origin & Grade Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.bestSeller && (
              <span className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary font-label-caps text-label-caps font-bold">
                Best Seller
              </span>
            )}
            {!product.bestSeller && product.isFeatured && (
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-caps text-label-caps font-bold">
                Export Grade
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-caps text-label-caps font-semibold">
              {product.originState || 'Nigeria'}
            </span>
          </div>

          {/* Top-Right Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-container-lowest/90 flex items-center justify-center transition-colors shadow-sm z-10 ${
              isFavorited ? 'text-error' : 'text-on-surface-variant hover:text-error'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
        </Link>

        {/* Product Details Header */}
        <div className="mt-space-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps">
            <span className="truncate max-w-[140px]">{product.supplier?.name || 'Verified Cooperative'}</span>
            <span className="text-secondary font-semibold shrink-0">
              {product.specifications?.moisture ? `Moisture ${product.specifications.moisture}` : 'Phytosanitary OK'}
            </span>
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
            Unit: {product.unit} {product.packageTiers && product.packageTiers.length > 0 ? `• ${product.packageTiers.length} specs available` : ''}
          </p>
        </div>
      </div>

      {/* Pricing & Call to Actions Container */}
      <div className="mt-space-md pt-space-xs bg-surface-container-low/50 -mx-space-sm -mb-space-sm p-space-sm rounded-b-xl border-t border-outline-variant/20">
        <div className="flex items-baseline justify-between mb-space-sm">
          <div>
            <span className="font-trade-price-md text-trade-price-md text-primary font-extrabold price-num">
              ₦{product.price.toLocaleString()}
            </span>
            {product.internationalPrice && (
              <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 price-num">
                (${product.internationalPrice.toFixed(2)}) / {product.unit}
              </span>
            )}
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-semibold">
            MOQ: {product.minOrderQty || 1} {product.unit}
          </span>
        </div>

        {/* Dual Actions Grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.availableQty <= 0}
            className={`w-full py-2 px-2 rounded-lg font-trade-unit text-trade-unit font-bold transition-colors flex items-center justify-center gap-1 ${
              product.availableQty > 0
                ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            <span>{product.availableQty > 0 ? 'Add Cart' : 'Out of Stock'}</span>
          </button>

          <button
            type="button"
            onClick={handleInquiry}
            className="w-full py-2 px-2 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-trade-unit text-trade-unit font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">request_quote</span>
            <span>Bulk Inquiry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
