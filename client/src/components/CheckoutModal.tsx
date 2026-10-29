import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import api from '../services/api.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerWhatsApp, setCustomerWhatsApp] = useState(user?.phone || '');
  const [deliveryCountry, setDeliveryCountry] = useState('NG');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [validatedData, setValidatedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentConfig, setPaymentConfig] = useState<{ enabled: boolean; message: string }>({
    enabled: false,
    message: '',
  });

  // Keep fields synced with user if user logs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerWhatsApp && user.phone) setCustomerWhatsApp(user.phone);
    }
  }, [user]);

  // Check payment gateway status and validate cart on backend
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setValidating(true);
      setErrorMsg('');

      // Fetch payment gateway configuration
      api
        .get('/payments/config')
        .then((res) => {
          if (res.data) {
            setPaymentConfig({
              enabled: res.data.enabled,
              message: res.data.message,
            });
          }
        })
        .catch(() => {});

      // Validate cart items and server-calculated totals
      api
        .post('/orders/validate-cart', {
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            tierLabel: i.tierLabel,
          })),
        })
        .then((res) => {
          if (res.data.success) {
            setValidatedData(res.data);
          } else {
            setErrorMsg(res.data.errors?.join(', ') || 'Some items could not be validated.');
          }
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to calculate order totals with server.');
        })
        .finally(() => {
          setValidating(false);
        });
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerWhatsApp.trim()) {
      setErrorMsg('WhatsApp phone number is required to coordinate delivery & dispatch.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Name and email are required to deliver your order confirmation.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await api.post('/orders', {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerWhatsApp: customerWhatsApp.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          tierLabel: i.tierLabel,
        })),
        deliveryAddress: {
          street: deliveryAddress.trim(),
          country: deliveryCountry,
        },
        notes: notes.trim(),
      });

      if (res.data.success) {
        const orderRef = res.data.orderReference;
        clearCart();
        onClose();
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${orderRef}`);
      } else {
        setErrorMsg(res.data.message || 'Failed to create order.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while creating order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/40">
        {/* Header */}
        <div className="p-space-md bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-headline-md">
              verified
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Order Checkout
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                FarmNexa Verified Agricultural Sourcing & Export Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-space-md flex flex-col gap-space-md">
          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-lg mt-0.5">error</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {/* 1. Customer Verification Block */}
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-space-xs border border-outline-variant/30">
            <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
              Step 1: Contact & Delivery Logistics
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-1">
              <div>
                <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Daniel Adeyemi"
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. daniel@example.com"
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* MANDATORY WHATSAPP CONTACT ONLY */}
            <div className="mt-2">
              <label className="font-trade-unit text-xs text-on-surface font-bold flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  WhatsApp Phone Number * (Required for Order Coordination)
                </span>
                <span className="text-[10px] text-on-surface-variant font-normal">
                  International or Nigerian Format
                </span>
              </label>
              <input
                type="tel"
                required
                value={customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
                placeholder="e.g. 08031234567 or +447911123456"
                className="w-full px-3 py-2 bg-surface-container-lowest border border-primary/50 focus:border-primary rounded-lg text-sm text-on-surface font-semibold focus:outline-none"
              />
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                FarmNexa trade logistics coordinates freight arrangements and customs dispatch via this WhatsApp number after order verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs mt-2">
              <div className="sm:col-span-1">
                <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                  Destination Country
                </label>
                <select
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface font-semibold focus:outline-none"
                >
                  <option value="NG">Nigeria 🇳🇬 (Domestic)</option>
                  <option value="UK">United Kingdom 🇬🇧</option>
                  <option value="USA">United States 🇺🇸</option>
                  <option value="CAN">Canada 🇨🇦</option>
                  <option value="EU">European Union 🇪🇺</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                  Delivery Address / Preferred Destination Port
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 42 Kensington Church St, London / Lagos Mainland"
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                Special Packaging or Export Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Multi-layer vacuum pack, air cargo priority"
                className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs text-on-surface focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Order Summary & Price Breakdown */}
          <div className="bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/30 flex flex-col gap-space-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant font-bold uppercase tracking-wider">
              Step 2: Validated Order Breakdown
            </span>

            {validating ? (
              <div className="py-4 text-center text-sm text-on-surface-variant flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <span>Validating stock and recalculating prices with database...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-on-surface">{item.name}</span>
                      {item.tierLabel && (
                        <span className="text-[10px] text-secondary bg-secondary-container px-1 rounded">
                          {item.tierLabel}
                        </span>
                      )}
                      <span className="text-on-surface-variant">× {item.quantity}</span>
                    </div>
                    <span className="font-bold text-primary price-num">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="pt-2 flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Produce Subtotal:</span>
                    <span className="font-semibold text-on-surface price-num">
                      ₦{(validatedData?.subtotal || items.reduce((acc, i) => acc + i.price * i.quantity, 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Transportation / Shipping:</span>
                    <span className="text-xs text-secondary font-semibold">
                      Arranged via WhatsApp Trade Desk
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/40">
                    <span className="font-trade-unit font-bold text-on-surface">Total Payable Amount:</span>
                    <span className="font-headline-md text-headline-md text-primary font-extrabold price-num">
                      ₦{(validatedData?.totalAmount || items.reduce((acc, i) => acc + i.price * i.quantity, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Gateway Notice */}
          <div className="p-3 rounded-xl bg-surface-container flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
              shield
            </span>
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-primary block font-semibold mb-0.5">
                Escrow Trade Coordination
              </strong>
              {paymentConfig.enabled ? (
                <p>Secure payment via Paystack checkout will be launched upon confirmation.</p>
              ) : (
                <p>
                  Paystack online gateway is pending live credentials. You can place your confirmed order now to lock in warehouse stock, and complete transportation & payment coordination directly via our verified WhatsApp trade desk.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-space-sm pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/60 font-trade-unit text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || validating}
              className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
