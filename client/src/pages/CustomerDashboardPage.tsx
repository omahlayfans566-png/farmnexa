import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import { IOrder } from '../types/index.js';

export const CustomerDashboardPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit Profile States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [country, setCountry] = useState(user?.address?.country || 'Nigeria');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api
      .get('/orders/my-orders')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [user, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        address: { street, city, country },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg('Profile updated successfully.');
      }
    } catch {
      setProfileMsg('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-lg">
        {/* Welcome Header */}
        <div className="p-space-lg bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container font-extrabold flex items-center justify-center text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                {user.name}
              </h1>
              <p className="font-body-sm text-on-surface-variant">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold capitalize">
                Verified Account
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 border border-error text-error hover:bg-error-container rounded-xl font-trade-unit text-xs font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Order History (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Order History
                  </h2>
                </div>
                <span className="text-xs text-on-surface-variant font-semibold">
                  {orders.length} Orders
                </span>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-on-surface-variant">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">
                    shopping_bag
                  </span>
                  <p className="font-semibold text-on-surface">No orders placed yet</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Explore our authentic agricultural catalogue to place your first consignment.
                  </p>
                  <Link
                    to="/products"
                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-trade-unit font-bold text-primary">
                            {ord.orderReference}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-highest text-on-surface-variant'
                            }`}
                          >
                            Payment: {ord.paymentStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-[10px] font-semibold capitalize">
                            Status: {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">
                          {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                        <span className="text-[11px] text-outline">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <span className="font-trade-price-md font-extrabold text-primary price-num">
                          ₦{ord.totalAmount.toLocaleString()}
                        </span>
                        <Link
                          to={`/order-confirmation/${ord.orderReference}`}
                          className="px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg font-trade-unit text-xs font-bold transition-colors"
                        >
                          View Order Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile & Saved Address (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Account Details
                </h2>
              </div>

              {profileMsg && (
                <div className="p-2.5 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold mb-3">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="2348000000000"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Delivery Street / Port
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-xs font-bold rounded-lg shadow-sm transition-all mt-1"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
