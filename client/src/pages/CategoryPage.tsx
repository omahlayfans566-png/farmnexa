import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { ICategory, IProduct } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<ICategory | null>(null);
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priceMax, setPriceMax] = useState<number>(150000);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch category & categories list
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const [catsRes, currentCatRes] = await Promise.all([
          api.get('/categories'),
          slug ? api.get(`/categories/${slug}`) : Promise.resolve({ data: { success: false } }),
        ]);

        if (catsRes.data.success) {
          setAllCategories(catsRes.data.categories);
        }

        if (currentCatRes.data?.success) {
          setCategory(currentCatRes.data.category);
        } else {
          setCategory(null);
        }
      } catch (err) {
        console.error('Error fetching category:', err);
      }
    };

    fetchCategoryDetails();
  }, [slug]);

  // Fetch products matching category and active filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (slug) params.set('category', slug);
        if (priceMax < 150000) params.set('maxPrice', priceMax.toString());
        if (selectedRegion) params.set('origin', selectedRegion);
        if (selectedSort) params.set('sort', selectedSort);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.pagination.pages);
          setTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching products for category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, priceMax, selectedRegion, selectedSort, page]);

  return (
    <div className="flex flex-col w-full">
      {/* BREADCRUMBS & CONTEXT BAR */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-sm bg-surface-container-low border-b border-outline-variant/30">
        <div className="flex flex-wrap items-center justify-between gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <nav className="flex items-center gap-space-xs flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-body-md text-primary">home</span>
              <span>Home</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <Link to="/products" className="hover:text-primary transition-colors">
              Agricultural Produce
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-on-surface">
              {category ? category.name : 'All Commodities'}
            </span>
            <span className="ml-space-xs px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps font-bold">
              {totalCount} items found
            </span>
          </nav>

          <div className="hidden md:flex items-center gap-space-md">
            <span className="flex items-center gap-1 text-primary font-trade-unit text-trade-unit font-bold">
              <span className="material-symbols-outlined text-body-md">verified_user</span>
              Global Phytosanitary & NAFDAC Compliant
            </span>
            <span className="text-outline-variant">|</span>
            <span className="flex items-center gap-1 text-tertiary-container font-trade-unit text-trade-unit font-bold">
              <span className="material-symbols-outlined text-body-md">flight_takeoff</span>
              DHL Air Express (3-5 Days Global)
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORY HERO & SUB-FILTER BANNER */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg bg-surface-container border-b border-outline-variant/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          <div className="lg:col-span-8 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-widest uppercase font-bold">
                Export Grade Tier 1
              </span>
              <span className="px-2.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps font-semibold">
                HS Code: {category?.hsCode || '0714.10.00'}
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl text-primary font-extrabold tracking-tight">
              {category ? category.name : 'Authentic Nigerian Agricultural Produce'}
            </h1>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl leading-relaxed">
              {category?.description ||
                'Processed through certified farming cooperatives, graded to international export standards, and vacuum packaged for moisture-safe domestic storage and international freight.'}
            </p>

            {/* Quick Sub-Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
              <button
                type="button"
                onClick={() => setSelectedRegion('')}
                className={`px-3 py-1.5 rounded-full font-trade-unit text-trade-unit font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                  selectedRegion === ''
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>All Varieties</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('Ogun')}
                className={`px-3 py-1.5 rounded-full font-trade-unit text-trade-unit font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                  selectedRegion === 'Ogun'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Ogun State (Ijebu Belt)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('Edo')}
                className={`px-3 py-1.5 rounded-full font-trade-unit text-trade-unit font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                  selectedRegion === 'Edo'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Edo State (Palm Oil Yellow)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('Delta')}
                className={`px-3 py-1.5 rounded-full font-trade-unit text-trade-unit font-semibold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                  selectedRegion === 'Delta'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Niger Delta Region</span>
              </button>
            </div>
          </div>

          {/* Quick Export Metrics Bento Card */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-bold">
                Commodity Telemetry
              </span>
              <span className="flex items-center gap-1 text-primary font-trade-unit text-trade-unit font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span> Live Batch Stock
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <div className="p-space-xs rounded bg-surface-container-low flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Avail. Warehouse
                </span>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  142.5 MT
                </span>
                <span className="font-body-sm text-body-sm text-secondary font-semibold">
                  Ready for Lagos Port
                </span>
              </div>
              <div className="p-space-xs rounded bg-surface-container-low flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Average Moisture
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  &lt; 9.4%
                </span>
                <span className="font-body-sm text-body-sm text-primary font-semibold">
                  Ultra-dry / Crisp
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-space-xs border-t border-outline-variant/20">
              <span>Inspection Partner: NAQS / SGS</span>
              <span className="font-semibold text-primary">Certified Safe</span>
            </div>
          </div>
        </div>

        {/* Active Filters Strip */}
        <div className="mt-space-md pt-space-sm flex flex-wrap items-center gap-space-xs bg-surface-container-lowest p-space-xs rounded-lg shadow-sm border border-outline-variant/30">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-space-xs mr-space-xs font-bold">
            Active Criteria:
          </span>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-trade-unit text-trade-unit font-medium">
            <span>Origin: Nigeria {selectedRegion ? `(${selectedRegion})` : ''}</span>
            {selectedRegion && (
              <button
                type="button"
                onClick={() => setSelectedRegion('')}
                className="hover:opacity-75 flex items-center"
              >
                <span className="material-symbols-outlined text-body-sm">close</span>
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-trade-unit text-trade-unit font-medium">
            <span>Export Phytosanitary: Certified</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-trade-unit text-trade-unit font-medium">
            <span>Packaging: Multi-layer Sealed</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedRegion('');
              setPriceMax(150000);
            }}
            className="ml-auto px-3 py-1 text-error hover:bg-error-container rounded font-trade-unit text-trade-unit font-semibold transition-colors flex items-center gap-1 text-xs"
          >
            <span className="material-symbols-outlined text-body-sm">restart_alt</span>
            <span>Reset Filters</span>
          </button>
        </div>
      </section>

      {/* MAIN CATALOG BODY (SIDEBAR + DENSE GRID) */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT SIDEBAR FILTERS (COL 3) */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md sticky top-32">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  <h2 className="font-headline-md text-headline-md text-primary font-bold">
                    Catalog Filters
                  </h2>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  {totalCount} Results
                </span>
              </div>

              {/* 1. Category Hierarchy */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Agricultural Categories
                </span>
                <div className="flex flex-col text-trade-unit space-y-1">
                  <Link
                    to="/products"
                    className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors ${
                      !slug
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-body-md">category</span> All Produce
                    </span>
                  </Link>

                  {allCategories.map((cat) => {
                    const isSelected = slug === cat.slug;
                    return (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors ${
                          isSelected
                            ? 'bg-primary-container text-on-primary-container font-bold'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.itemCount !== undefined && (
                          <span className="text-xs text-outline">{cat.itemCount}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dual-Currency Price Range Slider */}
              <div className="flex flex-col gap-space-xs pt-space-xs border-t border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                    Max Price Filter
                  </span>
                  <span className="font-trade-unit text-trade-unit text-primary font-bold price-num">
                    Up to ₦{priceMax.toLocaleString()}
                  </span>
                </div>
                <div className="relative w-full py-2">
                  <input
                    type="range"
                    min="5000"
                    max="150000"
                    step="5000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>₦5,000</span>
                  <span>₦150,000</span>
                </div>
              </div>

              {/* 3. Regional Origin */}
              <div className="flex flex-col gap-space-xs pt-space-xs border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Nigerian Region / Sourcing State
                </span>
                <div className="flex flex-col space-y-2 mt-1">
                  {[
                    { label: 'All Regions', val: '' },
                    { label: 'Ogun State (Ijebu Sourcing Zone)', val: 'Ogun' },
                    { label: 'Akwa Ibom (Oron Marine Coast)', val: 'Akwa Ibom' },
                    { label: 'Delta State (Mangrove Belt)', val: 'Delta' },
                    { label: 'Enugu State (Nsukka Agro Mills)', val: 'Enugu' },
                    { label: 'Kano State (Dawanau Grains Market)', val: 'Kano' },
                  ].map((r, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 text-trade-unit text-on-surface cursor-pointer text-xs"
                    >
                      <input
                        type="radio"
                        name="region_filter"
                        checked={selectedRegion === r.val}
                        onChange={() => setSelectedRegion(r.val)}
                        className="w-4 h-4 text-primary accent-primary cursor-pointer"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT PRODUCTS GRID (COL 9) */}
          <main className="lg:col-span-9 flex flex-col gap-space-md">
            {/* Sorting bar */}
            <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <strong>{products.length}</strong> of {totalCount} verified commodities
              </span>

              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Sort:
                </span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-surface-container-low px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface border border-outline-variant/40 focus:outline-none"
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Date: Oldest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md py-12">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-surface-container-lowest p-space-sm h-80 animate-pulse border border-outline-variant/30"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  No products matched your criteria
                </h3>
                <p className="font-body-sm text-on-surface-variant max-w-sm mt-1">
                  Try clearing the region or price filters to explore the rest of the agricultural catalogue.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion('');
                    setPriceMax(150000);
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-trade-unit text-xs font-bold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-space-lg">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/60 font-trade-unit text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-body-sm text-xs text-on-surface-variant px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/60 font-trade-unit text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};
