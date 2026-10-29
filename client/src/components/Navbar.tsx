import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import api from '../services/api.js';
import { ICategory } from '../types/index.js';

interface NavbarProps {
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState<boolean>(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch categories for search dropdown and ribbon
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside or Escape press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setAllCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    navigate(`/products?${params.toString()}`);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-28 w-full px-4 sm:px-6 lg:px-10 flex flex-col justify-between pt-2">
        {/* Top Header Row */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-display font-extrabold text-xl shadow-md">
              F
            </div>
            <span className="font-headline-lg text-2xl text-primary tracking-tight font-extrabold hidden sm:inline-block">
              FarmNexa
            </span>
          </Link>

          {/* Omni Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl mx-2 hidden md:flex items-center"
          >
            <div className="w-full flex items-center bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden transition-all">
              <div className="relative shrink-0 border-r border-outline-variant/30">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-surface-container-low pl-4 pr-9 py-2.5 font-body-sm text-sm text-on-surface-variant font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Produce</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="bulk-and-wholesale">Wholesale (Bulk)</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  arrow_drop_down
                </span>
              </div>

              <div className="relative flex-1 flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search garri, crayfish, palm oil, spices, honey beans..."
                  className="w-full pl-11 pr-4 py-2.5 font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-trade-unit text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Search</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Right Action Icons & User Account Area */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Delivery Destination Indicator */}
            <div className="hidden xl:flex flex-col text-right pr-1">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                Deliver to
              </span>
              <div className="flex items-center gap-1 font-trade-unit text-sm text-on-surface font-semibold">
                <span>🇳🇬 NG / 🇬🇧 UK / 🇺🇸 USA</span>
              </div>
            </div>

            {/* Currency Switcher */}
            <div className="hidden lg:flex flex-col text-right pr-1">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                Currency
              </span>
              <div className="flex items-center gap-1 font-trade-unit text-sm text-on-surface font-semibold">
                <span>NGN (₦) / USD ($)</span>
              </div>
            </div>

            {/* Account Controls Area: Round Profile Icon placed on the LEFT side */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  id="profile-dropdown-button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-primary/30 hover:ring-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm bg-surface-container-lowest"
                  title={`Account: ${user.name}`}
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm uppercase">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                      <p className="font-headline-md text-sm font-bold text-on-surface truncate">
                        {user.name}
                      </p>
                      <p className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                      role="menuitem"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">
                        person
                      </span>
                      <span className="font-medium">My Account & Orders</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        role="menuitem"
                      >
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-outline-variant/20 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-container transition-colors text-left font-medium"
                      role="menuitem"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-primary hover:bg-surface-container font-trade-unit text-sm font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-trade-unit text-sm font-semibold transition-colors shadow-sm hidden sm:inline-block"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
              title="View Wishlist"
            >
              <span className="material-symbols-outlined text-xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
              title="View Cart"
            >
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Ribbon */}
        <div className="h-12 flex items-center overflow-x-auto no-scrollbar py-1 relative">
          <nav className="flex items-center gap-2 whitespace-nowrap min-w-max">
            <button
              onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-trade-unit text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors mr-1"
            >
              <span className="material-symbols-outlined text-base">menu</span>
              <span>All Categories</span>
            </button>

            <Link
              to="/"
              className={`px-3 py-1.5 transition-colors font-trade-unit text-sm rounded-lg font-semibold ${
                location.pathname === '/'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Home
            </Link>

            {categories.map((cat) => {
              const isActive = location.pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className={`px-3 py-1.5 rounded-lg font-trade-unit text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}

            <Link
              to="/products"
              className={`px-3 py-1.5 rounded-lg font-trade-unit text-sm transition-colors font-semibold ${
                location.pathname === '/products'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              All Produce
            </Link>
          </nav>

          {/* All Categories Flyout Modal */}
          {allCategoriesOpen && (
            <div className="absolute top-12 left-0 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
                <span className="font-trade-unit text-sm font-bold text-primary">Browse All Categories</span>
                <button
                  type="button"
                  onClick={() => setAllCategoriesOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setAllCategoriesOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface text-sm transition-colors"
                  >
                    <span className="font-medium">{cat.name}</span>
                    {cat.itemCount !== undefined && cat.itemCount > 0 && (
                      <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-semibold">
                        {cat.itemCount} items
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
