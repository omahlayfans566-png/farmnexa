import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import { ICategory, IProduct, IOrder, IUser } from '../types/index.js';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'customers'>('overview');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);

  // Products
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Categories
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Orders
  const [orders, setOrders] = useState<IOrder[]>([]);

  // Customers
  const [customers, setCustomers] = useState<IUser[]>([]);

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState('');

  // Form states for Product
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodUsd, setProdUsd] = useState<number>(0);
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodQty, setProdQty] = useState<number>(100);
  const [prodMoq, setProdMoq] = useState<number>(1);
  const [prodOrigin, setProdOrigin] = useState('Ogun State, NG');
  const [prodImage, setProdImage] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);

  // Form states for Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catHs, setCatHs] = useState('');
  const [catImage, setCatImage] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [statsRes, prodsRes, catsRes, ordersRes, custRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?all=true&limit=50'),
        api.get('/categories?all=true'),
        api.get('/orders/admin/all?limit=50'),
        api.get('/admin/customers?limit=50'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentOrders(statsRes.data.recentOrders || []);
      }
      if (prodsRes.data.success) setProducts(prodsRes.data.products);
      if (catsRes.data.success) setCategories(catsRes.data.categories);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (custRes.data.success) setCustomers(custRes.data.customers);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Handle Cloudinary Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCategory = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', isCategory ? 'farmnexa/categories' : 'farmnexa/products');

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        if (isCategory) {
          setCatImage(res.data.url);
        } else {
          setProdImage(res.data.url);
        }
        setMsg('Image uploaded to Cloudinary successfully.');
      }
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        description: prodDesc,
        category: prodCat || categories[0]?._id,
        price: prodPrice,
        internationalPrice: prodUsd || undefined,
        unit: prodUnit,
        availableQty: prodQty,
        minOrderQty: prodMoq,
        originState: prodOrigin,
        images: prodImage ? [prodImage] : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
        isFeatured: prodFeatured,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        setMsg('Product updated successfully.');
      } else {
        await api.post('/products', payload);
        setMsg('Product created successfully.');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error saving product.');
    }
  };

  // Category Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: catName,
        description: catDesc,
        hsCode: catHs,
        image: catImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        setMsg('Category updated successfully.');
      } else {
        await api.post('/categories', payload);
        setMsg('Category created successfully.');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error saving category.');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/admin/${orderId}`, { orderStatus: newStatus });
      setMsg('Order status updated.');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error updating order.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
        {/* Header */}
        <div className="p-space-lg bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-2xl shadow-sm">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                FarmNexa Administration Portal
              </h1>
              <p className="font-body-sm text-on-surface-variant text-xs">
                Real database oversight, product inventory, categories, and order fulfillment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-xs font-bold uppercase">
              Production Admin Mode
            </span>
          </div>
        </div>

        {msg && (
          <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{msg}</span>
            <button type="button" onClick={() => setMsg('')} className="text-sm font-bold">
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
            { id: 'products', label: 'Products Inventory', icon: 'inventory_2' },
            { id: 'categories', label: 'Categories Management', icon: 'category' },
            { id: 'orders', label: 'Orders & WhatsApp Dispatch', icon: 'local_shipping' },
            { id: 'customers', label: 'Registered Customers', icon: 'group' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-trade-unit text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="flex flex-col gap-space-lg">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Total Products
                </span>
                <span className="font-headline-xl text-headline-xl font-extrabold text-primary mt-1">
                  {stats.totalProducts}
                </span>
                <span className="text-xs text-secondary mt-1 font-semibold">
                  {stats.publishedProducts} Published
                </span>
              </div>

              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Total Orders
                </span>
                <span className="font-headline-xl text-headline-xl font-extrabold text-primary mt-1">
                  {stats.totalOrders}
                </span>
                <span className="text-xs text-secondary mt-1 font-semibold">
                  {stats.paidOrders} Verified Paid
                </span>
              </div>

              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Total Revenue
                </span>
                <span className="font-headline-xl text-headline-xl font-extrabold text-primary mt-1 price-num">
                  ₦{stats.totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-on-surface-variant mt-1 font-semibold">
                  From paid orders
                </span>
              </div>

              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Registered Customers
                </span>
                <span className="font-headline-xl text-headline-xl font-extrabold text-primary mt-1">
                  {stats.registeredCustomers}
                </span>
                <span className="text-xs text-secondary mt-1 font-semibold">Verified Users</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Recent Consignment Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                    <tr>
                      <th className="p-2.5">Reference</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">WhatsApp</th>
                      <th className="p-2.5">Total Amount</th>
                      <th className="p-2.5">Payment</th>
                      <th className="p-2.5">Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low">
                        <td className="p-2.5 font-bold text-primary">{ord.orderReference}</td>
                        <td className="p-2.5">{ord.customerName}</td>
                        <td className="p-2.5 font-semibold text-secondary">{ord.customerWhatsApp}</td>
                        <td className="p-2.5 font-bold price-num">₦{ord.totalAmount.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            ord.paymentStatus === 'paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2.5 capitalize">{ord.orderStatus.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-on-surface">Manage Products ({products.length})</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProdName('');
                  setProdDesc('');
                  setProdPrice(9500);
                  setProdUsd(12.5);
                  setProdUnit('5kg bag');
                  setProdQty(100);
                  setProdMoq(1);
                  setProdOrigin('Ogun State, NG');
                  setProdImage('');
                  setShowProductModal(true);
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add New Product</span>
              </button>
            </div>

            <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5">Origin</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">Stock Qty</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low">
                      <td className="p-2.5 flex items-center gap-2">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-bold text-on-surface">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{p.unit}</p>
                        </div>
                      </td>
                      <td className="p-2.5">{p.originState}</td>
                      <td className="p-2.5 font-bold text-primary price-num">₦{p.price.toLocaleString()}</td>
                      <td className="p-2.5 font-semibold">{p.availableQty}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stockStatus === 'in_stock' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                        }`}>
                          {p.stockStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setProdName(p.name);
                            setProdDesc(p.description);
                            setProdPrice(p.price);
                            setProdUsd(p.internationalPrice || 0);
                            setProdUnit(p.unit);
                            setProdQty(p.availableQty);
                            setProdMoq(p.minOrderQty);
                            setProdOrigin(p.originState);
                            setProdImage(p.images[0] || '');
                            setProdFeatured(p.isFeatured);
                            setShowProductModal(true);
                          }}
                          className="px-2.5 py-1 bg-surface-container text-primary font-bold rounded mr-1 hover:bg-surface-container-high"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-on-surface">Manage Categories ({categories.length})</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCatName('');
                  setCatDesc('');
                  setCatHs('');
                  setCatImage('');
                  setShowCategoryModal(true);
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
              {categories.map((c) => (
                <div key={c._id} className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <img src={c.image} alt={c.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                    <h4 className="font-headline-md text-sm font-bold text-primary">{c.name}</h4>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1">{c.description}</p>
                    <span className="inline-block mt-2 text-[10px] bg-surface-container px-2 py-0.5 rounded font-mono">
                      HS: {c.hsCode || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/20 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(c);
                        setCatName(c.name);
                        setCatDesc(c.description);
                        setCatHs(c.hsCode || '');
                        setCatImage(c.image);
                        setShowCategoryModal(true);
                      }}
                      className="px-3 py-1 bg-surface-container text-primary font-bold rounded text-xs hover:bg-surface-container-high"
                    >
                      Edit Category
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-space-md">
            <h3 className="font-headline-md font-bold text-on-surface">Fulfillment & WhatsApp Coordination ({orders.length})</h3>
            <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5">Customer & WhatsApp</th>
                    <th className="p-2.5">Items</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5">Order Status</th>
                    <th className="p-2.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low">
                      <td className="p-2.5 font-bold text-primary">{o.orderReference}</td>
                      <td className="p-2.5">
                        <p className="font-semibold">{o.customerName}</p>
                        <a
                          href={`https://wa.me/${o.customerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${o.customerName}, regarding your FarmNexa order ${o.orderReference}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary font-bold hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">chat</span>
                          <span>{o.customerWhatsApp}</span>
                        </a>
                      </td>
                      <td className="p-2.5 max-w-xs truncate">
                        {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                      </td>
                      <td className="p-2.5 font-bold price-num">₦{o.totalAmount.toLocaleString()}</td>
                      <td className="p-2.5 uppercase font-bold text-[10px]">{o.paymentStatus}</td>
                      <td className="p-2.5 capitalize">{o.orderStatus.replace(/_/g, ' ')}</td>
                      <td className="p-2.5 text-right">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          className="bg-surface-container-low px-2 py-1 rounded border border-outline-variant/40 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="ready_for_dispatch">Ready for Dispatch</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="flex flex-col gap-space-md">
            <h3 className="font-headline-md font-bold text-on-surface">Registered Customers ({customers.length})</h3>
            <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">WhatsApp Contact</th>
                    <th className="p-2.5">Total Orders</th>
                    <th className="p-2.5">Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low">
                      <td className="p-2.5 font-bold text-on-surface">{c.name}</td>
                      <td className="p-2.5 text-on-surface-variant">{c.email}</td>
                      <td className="p-2.5 font-semibold text-secondary">{c.phone || 'N/A'}</td>
                      <td className="p-2.5 font-bold">{(c as any).orderCount || 0}</td>
                      <td className="p-2.5 text-outline">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCT CREATE/EDIT MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg max-w-xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/40">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-3">
                <h3 className="font-headline-md font-bold text-primary">
                  {editingProduct ? 'Edit Agricultural Product' : 'Add New Agricultural Product'}
                </h3>
                <button type="button" onClick={() => setShowProductModal(false)} className="text-lg">
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Price in Naira (₦)</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">USD Price ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={prodUsd}
                      onChange={(e) => setProdUsd(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Unit of Sale</label>
                    <input
                      type="text"
                      required
                      value={prodUnit}
                      onChange={(e) => setProdUnit(e.target.value)}
                      placeholder="e.g. 5kg bag"
                      className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Available Stock Qty</label>
                    <input
                      type="number"
                      required
                      value={prodQty}
                      onChange={(e) => setProdQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">MOQ</label>
                    <input
                      type="number"
                      required
                      value={prodMoq}
                      onChange={(e) => setProdMoq(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Origin State / Region</label>
                  <input
                    type="text"
                    value={prodOrigin}
                    onChange={(e) => setProdOrigin(e.target.value)}
                    placeholder="e.g. Ogun State, NG"
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                {/* Cloudinary Image Upload */}
                <div className="p-3 bg-surface-container-low rounded-xl border">
                  <label className="font-bold block mb-1 text-primary">Upload Product Image (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="w-full text-xs"
                  />
                  {uploadingImage && <p className="text-secondary font-bold mt-1">Uploading to Cloudinary...</p>}
                  {prodImage && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={prodImage} alt="" className="w-12 h-12 object-cover rounded" />
                      <span className="text-[10px] text-outline truncate">{prodImage}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="feat"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                  />
                  <label htmlFor="feat" className="font-bold">Feature on Homepage</label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY CREATE/EDIT MODAL */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg max-w-md w-full border border-outline-variant/40">
              <div className="flex justify-between items-center pb-3 border-b mb-3">
                <h3 className="font-headline-md font-bold text-primary">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="text-lg">
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Harmonized HS Code</label>
                  <input
                    type="text"
                    value={catHs}
                    onChange={(e) => setCatHs(e.target.value)}
                    placeholder="e.g. 0714.10.00"
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border rounded-lg"
                  />
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border">
                  <label className="font-bold block mb-1 text-primary">Upload Category Image (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full text-xs"
                  />
                  {uploadingImage && <p className="text-secondary font-bold mt-1">Uploading...</p>}
                  {catImage && <img src={catImage} alt="" className="w-12 h-12 object-cover rounded mt-2" />}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
