import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { IOrder } from '../types/index.js';

export const OrderConfirmationPage: React.FC = () => {
  const { reference, ref: altRef } = useParams<{ reference?: string; ref?: string }>();
  const orderRef = reference || altRef;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderRef) {
      api
        .get(`/orders/${orderRef}`)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.order);
            setIsPaid(res.data.isPaid || res.data.order.paymentStatus === 'paid');
            setWhatsappUrl(res.data.whatsappUrl || '');
          }
        })
        .catch((err) => {
          console.error('Error fetching order:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderRef]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-primary font-trade-unit text-base font-semibold">
          <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full py-20 text-center flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
          <span className="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h2 className="text-2xl font-bold text-primary">Order Not Found</h2>
        <p className="text-sm text-on-surface-variant mt-2 max-w-md">
          We could not locate an order matching reference "{orderRef}". Please verify your reference number or contact support.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-4 sm:px-6 lg:px-10 bg-surface">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Status Notification Header */}
        {isPaid ? (
          <div className="p-6 bg-secondary-container rounded-2xl border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-container font-label-caps">
                  Verified Transaction
                </span>
                <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-secondary-container">
                  Payment Confirmed! Thank you for your order.
                </h1>
                <p className="text-sm text-on-secondary-container/90 mt-1">
                  Your payment has been successfully verified. You can now arrange transportation with the owner.
                </p>
              </div>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-secondary hover:bg-secondary/90 text-on-secondary font-trade-unit text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Discuss Transportation on WhatsApp</span>
              </a>
            )}
          </div>
        ) : (
          <div className="p-6 bg-surface-container-high rounded-2xl border border-outline-variant/40 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-3 text-tertiary">
              <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
              <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
                Order Placed — Payment Pending
              </h1>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your order <strong className="text-on-surface font-semibold">{order.orderReference}</strong> has been registered in our system. Payment has not yet been confirmed. Once your payment is verified, you will be able to discuss transportation directly with the business owner.
            </p>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/20">
            <div>
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                Order Reference
              </span>
              <p className="font-headline-md text-xl font-extrabold text-primary">
                {order.orderReference}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Payment Status
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-0.5 ${
                    order.paymentStatus === 'paid'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Fulfillment Status
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-bold capitalize mt-0.5">
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h2 className="font-headline-md text-base font-bold text-on-surface mb-3">
              Items Purchased
            </h2>
            <div className="divide-y divide-outline-variant/20">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-surface-container shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
                        <span className="material-symbols-outlined">agriculture</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-trade-unit text-sm font-bold text-on-surface truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {item.quantity} × ₦{item.price.toLocaleString()} per {item.unit}
                        {item.tierLabel && ` (${item.tierLabel})`}
                      </p>
                    </div>
                  </div>

                  <span className="font-trade-price-md text-sm font-bold text-primary shrink-0 price-num">
                    ₦{item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2 max-w-sm ml-auto text-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal:</span>
              <span className="font-medium price-num">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Transportation:</span>
              <span className="font-medium">Arranged via WhatsApp</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-outline-variant/30">
              <span>Total Amount:</span>
              <span className="price-num">₦{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Customer & Delivery Coordination Details */}
          <div className="pt-6 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-trade-unit font-bold text-on-surface mb-2">
                Customer Information
              </h3>
              <p className="text-on-surface-variant">Name: <strong className="text-on-surface font-medium">{order.customerName}</strong></p>
              <p className="text-on-surface-variant">Email: <strong className="text-on-surface font-medium">{order.customerEmail}</strong></p>
              <p className="text-on-surface-variant">WhatsApp: <strong className="text-on-surface font-medium">{order.customerWhatsApp}</strong></p>
            </div>

            <div>
              <h3 className="font-trade-unit font-bold text-on-surface mb-2">
                Delivery Destination
              </h3>
              {order.deliveryAddress?.street ? (
                <p className="text-on-surface-variant leading-relaxed">
                  {order.deliveryAddress.street}
                  {order.deliveryAddress.city && `, ${order.deliveryAddress.city}`}
                  {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                  {order.deliveryAddress.country && `, ${order.deliveryAddress.country}`}
                </p>
              ) : (
                <p className="text-on-surface-variant">To be coordinated with seller via WhatsApp.</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/products"
            className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-trade-unit text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Continue Shopping</span>
          </Link>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-xl font-trade-unit text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span>View My Account Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
