import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { ICategory, IProduct } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'airCargo' | 'bulk'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (prodRes.data.success) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'airCargo') return p.airCargoReady;
    if (activeFilter === 'bulk') return p.wholesaleAvailable;
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* SECTION A: HERO STAGE */}
      <section className="relative w-full bg-gradient-to-b from-surface-container-high/40 via-surface to-surface overflow-hidden pt-space-md pb-space-xl">
        <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="relative rounded-2xl bg-primary text-on-primary overflow-hidden shadow-xl border border-primary-container">
            {/* Living ambient SVG organic waves */}
            <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-tertiary-container/30 blur-2xl pointer-events-none"></div>

            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[520px]">
              {/* Hero Copy Block */}
              <div className="lg:col-span-7 p-space-lg md:p-space-xl lg:p-12 flex flex-col justify-between z-10">
                <div>
                  <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-highest/20 backdrop-blur-md text-tertiary-fixed font-label-caps text-label-caps tracking-widest uppercase mb-space-md">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                    Official Export Gateway • Diaspora & B2B
                  </div>
                  <h1 className="font-display-lg text-headline-xl md:text-display-lg font-extrabold text-on-primary tracking-tight leading-tight max-w-xl">
                    Discover the Best of Nigerian Farm Produce.
                  </h1>
                  <p className="mt-space-md font-body-lg text-body-md md:text-body-lg text-on-primary-container max-w-xl leading-relaxed">
                    Shop authentic agricultural products sourced directly from Nigerian farmers and certified processing hubs, with reliable domestic supply and international wholesale coordination.
                  </p>
                </div>

                {/* CTAs and Badges */}
                <div className="mt-space-lg flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <a
                      href="#popular-catalog"
                      className="px-6 py-3.5 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-trade-unit text-trade-unit font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-space-xs"
                    >
                      <span>Shop Farm Produce</span>
                      <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                    </a>
                    <Link
                      to="/category/bulk-and-wholesale"
                      className="px-6 py-3.5 bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-trade-unit text-trade-unit font-semibold rounded-xl transition-colors flex items-center gap-space-xs"
                    >
                      <span>Explore Wholesale Catalog</span>
                      <span className="material-symbols-outlined text-body-md">inventory_2</span>
                    </Link>
                  </div>

                  {/* Floating Micro-badges */}
                  <div className="pt-space-md flex flex-wrap items-center gap-space-sm">
                    <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-md text-surface-bright font-trade-unit text-body-sm">
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-body-md">
                        workspace_premium
                      </span>
                      <span>100% Authentic Nigerian Sourced</span>
                    </div>
                    <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-md text-surface-bright font-trade-unit text-body-sm">
                      <span className="material-symbols-outlined text-primary-fixed text-body-md">
                        verified_user
                      </span>
                      <span>Quality Graded & Cleaned</span>
                    </div>
                    <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-md text-surface-bright font-trade-unit text-body-sm">
                      <span className="material-symbols-outlined text-secondary-fixed text-body-md">
                        eco
                      </span>
                      <span>Direct Farmer Unions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnyyDw_heFEcw9RRgvdlcHnrEt1_q9xr-S1EBr4j6eyuScImTHsM7CWMcuU5JVV4cmbYhagpDnxlgbGTyYxXlYo9ADTYNBruUEpTxTtv9WzKaGj8Tv2F1NFbpS61UKlBGhwUHJO38UuNzzW2tOAqv1sBG2lYJ7WNPMdfOxOxPasAQYIjt5u3e1jAb1CR2nzS_rM5zlha_qEgls4giEN2S1lj-ZuEKWu79_n-kt_Q_7pe6JUjVMs4Ww')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent lg:bg-gradient-to-r lg:from-primary lg:via-transparent lg:to-transparent" />

                {/* Direct Sourcing Pill */}
                <div className="absolute bottom-space-md right-space-md left-space-md sm:left-auto bg-surface-container-lowest/90 backdrop-blur-md p-space-md rounded-xl shadow-xl text-on-surface max-w-xs border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-space-sm mb-space-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-bold">
                        Nigerian Agricultural Hub
                      </span>
                    </div>
                  </div>
                  <p className="font-trade-unit text-trade-unit font-bold text-primary">
                    Direct Farmgate Sourcing
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Connecting local producers with domestic consumers and wholesale buyers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: SHOP BY CATEGORY */}
      <section className="w-full py-space-xl bg-surface">
        <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg">
            <div>
              <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                Agronomic Spectrum
              </span>
              <h2 className="font-headline-xl text-headline-xl text-primary font-bold mt-1">
                Explore Curated Categories
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 md:mt-0">
              Cleaned, graded, and export-compliant commodities directly sourced from local farming unions across Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="group relative rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border border-outline-variant/30"
              >
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-surface-container mb-space-sm">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                    {cat.itemCount !== undefined && cat.itemCount > 0 ? `${cat.itemCount}+ items` : 'Grade A'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold group-hover:text-secondary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-space-sm flex items-center justify-between text-secondary font-trade-unit text-trade-unit font-semibold">
                  <span>Browse Category</span>
                  <span className="material-symbols-outlined text-body-md group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION C: POPULAR PRODUCTS GRID */}
      <section className="w-full py-space-xl bg-surface-container-low/40" id="popular-catalog">
        <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm mb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary">verified</span>
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                  Fast Moving SKUs
                </span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-primary font-bold">
                Top Verified Agricultural Produce
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-space-xs bg-surface-container p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-trade-unit text-trade-unit font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Produce
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('airCargo')}
                className={`px-3 py-1.5 rounded-lg font-trade-unit text-trade-unit font-semibold transition-colors ${
                  activeFilter === 'airCargo'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Air Cargo Ready
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('bulk')}
                className={`px-3 py-1.5 rounded-lg font-trade-unit text-trade-unit font-semibold transition-colors ${
                  activeFilter === 'bulk'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Bulk Discounts
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md py-12">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-surface-container-lowest p-space-sm h-80 animate-pulse border border-outline-variant/30"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION D: WHOLESALE & B2B ACCELERATOR STAGE */}
      <section className="w-full py-space-xl bg-surface" id="wholesale-rfp">
        <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="rounded-2xl bg-gradient-to-r from-primary via-primary-container to-secondary p-space-lg md:p-space-xl text-on-primary flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-xl">
            <div className="flex flex-col gap-space-xs max-w-2xl">
              <span className="font-label-caps text-label-caps text-tertiary-fixed uppercase font-bold tracking-widest">
                Direct Export Trade Operations
              </span>
              <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight">
                Institutional Bulk Sourcing & Container Freight
              </h2>
              <p className="font-body-md text-on-primary-container leading-relaxed">
                Source 20ft / 40ft dry cargo containers or palletized air cargo directly from certified Nigerian farm clusters. Fully compliant with UK, US FDA, and EU phytosanitary border inspections.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0">
              <a
                href="https://wa.me/2348000000000?text=Hello%20FarmNexa%20B2B%20Desk%2C%20I%20am%20requesting%20a%20commercial%20commodity%20export%20quotation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-trade-unit text-trade-unit font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-body-md">chat</span>
                <span>Request Wholesale FOB/CIF Quote</span>
              </a>
              <Link
                to="/products"
                className="px-6 py-3 bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 backdrop-blur-md text-on-primary font-trade-unit text-trade-unit font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-body-md">storefront</span>
                <span>Browse All Produce</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
