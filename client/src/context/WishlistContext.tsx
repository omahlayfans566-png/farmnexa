import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fnx_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      api
        .get('/wishlist')
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.products)) {
            const ids = res.data.products.map((p: any) => p._id || p);
            setWishlistIds(ids);
            localStorage.setItem('fnx_wishlist', JSON.stringify(ids));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (user) {
      try {
        const res = await api.post('/wishlist/toggle', { productId });
        if (res.data.success) {
          const isAdded = res.data.isAdded;
          setWishlistIds((prev) => {
            const updated = isAdded
              ? [...prev, productId]
              : prev.filter((id) => id !== productId);
            localStorage.setItem('fnx_wishlist', JSON.stringify(updated));
            return updated;
          });
          return isAdded;
        }
      } catch {}
    }

    // Guest fallback
    let isAdded = false;
    setWishlistIds((prev) => {
      let updated: string[];
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
        isAdded = false;
      } else {
        updated = [...prev, productId];
        isAdded = true;
      }
      localStorage.setItem('fnx_wishlist', JSON.stringify(updated));
      return updated;
    });
    return isAdded;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        count: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
