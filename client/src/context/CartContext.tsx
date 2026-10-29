import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem } from '../types/index.js';

interface CartContextType {
  items: ICartItem[];
  addToCart: (item: ICartItem) => void;
  updateQuantity: (productId: string, tierLabel: string | undefined, qty: number) => void;
  removeFromCart: (productId: string, tierLabel: string | undefined) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ICartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fnx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fnx_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (newItem: ICartItem) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (i) => i.productId === newItem.productId && i.tierLabel === newItem.tierLabel
      );
      if (index > -1) {
        const copy = [...prev];
        copy[index].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: string, tierLabel: string | undefined, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter(
          (i) => !(i.productId === productId && i.tierLabel === (tierLabel || ''))
        );
      }
      return prev.map((i) => {
        if (i.productId === productId && i.tierLabel === (tierLabel || '')) {
          return { ...i, quantity: qty };
        }
        return i;
      });
    });
  };

  const removeFromCart = (productId: string, tierLabel: string | undefined) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.tierLabel === (tierLabel || '')))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
