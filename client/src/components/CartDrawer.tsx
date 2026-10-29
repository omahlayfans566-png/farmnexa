import React from 'react';
import { useCart } from '../context/CartContext.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-headline-md">
                shopping_bag
              </span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Your Produce Basket
              </h2>
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-label-caps font-bold">
                {totalItems} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-space-sm">
                  <span className="material-symbols-outlined text-3xl">remove_shopping_cart</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Your cart is empty
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-1">
                  Explore authentic Nigerian garri, dried crayfish, smoked fish, and seasonings to get started.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-space-md px-space-md py-2 bg-primary text-on-primary rounded-lg font-trade-unit text-trade-unit font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.productId}_${item.tierLabel || ''}_${index}`}
                  className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-surface-container shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-trade-unit text-trade-unit text-on-surface font-bold truncate">
                      {item.name}
                    </h4>
                    {item.tierLabel && (
                      <span className="font-label-caps text-label-caps text-secondary font-semibold block">
                        Spec: {item.tierLabel}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-trade-price-md text-primary font-bold price-num">
                        ₦{item.price.toLocaleString()}
                      </span>
                      <span className="font-body-sm text-on-surface-variant text-xs">
                        / {item.unit}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-surface-container-lowest rounded-md shadow-sm border border-outline-variant/40 overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.tierLabel, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">remove</span>
                        </button>
                        <span className="w-8 text-center font-trade-unit text-xs font-bold price-num">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.tierLabel, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.tierLabel)}
                        className="text-xs text-error hover:underline flex items-center gap-0.5 ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Call to Action */}
          {items.length > 0 && (
            <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-low flex flex-col gap-space-sm">
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-trade-unit text-trade-unit text-on-surface-variant font-medium">
                  Subtotal:
                </span>
                <span className="font-headline-md text-headline-md text-primary font-extrabold price-num">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Verified Freshness & Phytosanitary Export Standards</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-trade-unit font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs"
              >
                <span className="material-symbols-outlined text-body-md">lock</span>
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
