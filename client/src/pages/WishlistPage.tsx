import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.js';
import api from '../services/api.js';
import { IProduct } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export const WishlistPage: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await api.get('/products?all=true&limit=100');
        if (res.data.success) {
          const allProds: IProduct[] = res.data.products;
          const filtered = allProds.filter((p) => wishlistIds.includes(p._id));
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error loading wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
              Saved Commodities
            </span>
            <h1 className="font-headline-xl text-headline-xl font-bold text-primary">
              Your Saved Wishlist
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-xs font-bold">
            {wishlistIds.length} Saved
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-on-surface-variant">Loading saved products...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-2">favorite_border</span>
            <h3 className="font-headline-md font-bold text-on-surface">Your wishlist is empty</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mt-1">
              Click the heart icon on any produce item in the marketplace to save it for quick reordering.
            </p>
            <Link to="/products" className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs">
              Explore Produce Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
