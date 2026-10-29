import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { IProduct, IPackageTier } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { ProductCard } from '../components/ProductCard.js';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<IPackageTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('UK');
  const [activeTab, setActiveTab] = useState<'specs' | 'sourcing' | 'logistics'>('specs');
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod: IProduct = res.data.product;
          setProduct(prod);
          setRelated(res.data.related || []);
          setSelectedImage(prod.images[0] || '');
          if (prod.packageTiers && prod.packageTiers.length > 0) {
            setSelectedTier(prod.packageTiers[0]);
          } else {
            setSelectedTier(null);
          }
          setQuantity(prod.minOrderQty || 1);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary font-trade-unit text-lg font-bold">
          <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          <span>Loading verified agricultural specifications...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-20 text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-primary">Produce item not found</h2>
        <Link to="/products" className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const currentPrice = selectedTier ? selectedTier.price : product.price;
  const currentUsdPrice = selectedTier?.usdPrice || product.internationalPrice;
  const currentUnit = selectedTier ? selectedTier.label : product.unit;

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: currentPrice,
      unit: currentUnit,
      quantity,
      image: selectedImage || product.images[0] || '',
      tierLabel: selectedTier?.label,
      slug: product.slug,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyWithEscrow = () => {
    handleAddToCart();
    navigate('/products');
  };

  const countryFeasibility: Record<string, string> = {
    UK: 'Eligible for DHL Express Air Cargo: Estimated 3–5 business days to UK. Automatic Nigerian Phytosanitary & CITES exemption certificate issued with consignment.',
    USA: 'Eligible for US FDA Prior Notice & Air Cargo: Estimated 4–6 business days to JFK, Houston, or Atlanta terminals.',
    CAN: 'Eligible for Canadian CFIA Cleared Air Cargo: Estimated 4–6 business days to Toronto Pearson (YYZ) & Montreal.',
    EU: 'Eligible for EU Border Control Point (BCP) Entry: Estimated 3–5 business days to Frankfurt or Schiphol cargo hubs.',
    NG: 'Domestic Nationwide Express Courier: Dispatched from Lagos Central Hub within 24–48 hours to all 36 states.',
  };

  return (
    <div className="flex flex-col w-full">
      {/* BREADCRUMBS & ESCROW BADGE BAR */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md border-b border-outline-variant/30">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors font-semibold">
              Home
            </Link>
            <span className="material-symbols-outlined text-body-sm">chevron_right</span>
            <Link to="/products" className="hover:text-primary transition-colors">
              Produce Catalogue
            </Link>
            <span className="material-symbols-outlined text-body-sm">chevron_right</span>
            <span className="font-semibold text-on-surface truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider shadow-sm font-bold">
            <span className="material-symbols-outlined text-secondary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <span>Escrow Trade Protected • Phytosanitary Inspected</span>
          </div>
        </div>
      </section>

      {/* MAIN PRODUCT DISPLAY (Bento Split) */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* LEFT: VISUAL GALLERY MODULE (5 Cols) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-space-md">
            {/* Main Stage Container */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low shadow-md group border border-outline-variant/30">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Origin & Logistics Overlays */}
              <div className="absolute top-space-sm left-space-sm flex flex-col gap-space-xs z-10">
                <span className="bg-primary text-on-primary font-label-caps text-label-caps px-space-sm py-1 rounded shadow-sm uppercase tracking-wider flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-body-sm">location_on</span>
                  {product.originState}
                </span>
                {product.airCargoReady && (
                  <span className="bg-secondary text-on-secondary font-label-caps text-label-caps px-space-sm py-1 rounded shadow-sm uppercase tracking-wider flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-body-sm">airplanemode_active</span>
                    Air Cargo Ready
                  </span>
                )}
              </div>

              {/* Official Stamp */}
              <div className="absolute top-space-sm right-space-sm bg-surface-container-lowest/95 backdrop-blur-md p-space-xs rounded-xl shadow-md flex items-center gap-1.5 z-10">
                <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                  </span>
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="font-label-caps text-label-caps text-primary font-bold leading-none">EXPORT PASSED</span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">Verified Pure</span>
                </div>
              </div>
            </div>

            {/* Multi-Angle Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-space-xs">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-surface-container shadow-sm p-0.5 focus:outline-none transition-all ${
                      selectedImage === img ? 'ring-2 ring-primary opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded" />
                  </button>
                ))}
              </div>
            )}

            {/* Phytosanitary Spec Strip */}
            <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-body-md">science</span>
                <span>Moisture {product.specifications?.moisture || '< 9%'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-body-md">water_drop</span>
                <span>{product.specifications?.processing || 'Standard Processed'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-body-md">shield</span>
                <span>Zero Additives</span>
              </div>
            </div>
          </div>

          {/* RIGHT: COMMERCIAL & PURCHASE CONTROLS (7 Cols) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-space-md">
            {/* Supplier Badge & Title */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-trade-unit text-trade-unit">
                  <span className="material-symbols-outlined text-primary text-body-md">storefront</span>
                  <span className="font-semibold text-primary">{product.supplier?.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded font-label-caps text-label-caps text-on-surface">
                  <span className="material-symbols-outlined text-tertiary-container text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-bold">{product.supplier?.rating || 4.9} / 5.0</span>
                  <span className="text-on-surface-variant">(Export Verified)</span>
                </div>
              </div>

              <h1 className="font-headline-lg text-headline-lg md:font-headline-xl md:text-headline-xl text-primary font-bold tracking-tight">
                {product.name}
              </h1>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing Tiers & Unit Breakdown */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-baseline gap-space-sm">
                <span className="font-trade-price-lg text-trade-price-lg text-primary price-num">
                  ₦{currentPrice.toLocaleString()}
                </span>
                {currentUsdPrice && (
                  <span className="font-headline-md text-headline-md text-on-surface-variant font-normal price-num">
                    (${currentUsdPrice.toFixed(2)} USD)
                  </span>
                )}
                <span className="bg-tertiary-container text-on-tertiary-container font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold">
                  DIRECT FARM PRICE
                </span>
              </div>

              <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                <span>Unit: <strong className="text-on-surface font-semibold">{currentUnit}</strong></span>
                <span className="flex items-center gap-1 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-body-sm">check_circle</span>
                  Phytosanitary Certificate Included
                </span>
              </div>
            </div>

            {/* Package Spec Volume Selector */}
            {product.packageTiers && product.packageTiers.length > 0 && (
              <div className="flex flex-col gap-space-xs">
                <label className="font-trade-unit text-trade-unit text-on-surface font-bold flex items-center justify-between">
                  <span>Select Packaging Spec / Volume:</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                    Multi-Barrier Sealed
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                  {product.packageTiers.map((tier, idx) => {
                    const isSelected = selectedTier?.label === tier.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`p-space-sm rounded-xl text-left shadow-sm transition-all flex flex-col justify-between border ${
                          isSelected
                            ? 'bg-primary-container text-on-primary-container border-primary font-bold'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/40'
                        }`}
                      >
                        <span className="font-trade-unit text-xs truncate">{tier.label}</span>
                        <span className="font-body-sm text-xs mt-1 price-num">₦{tier.price.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Destination Eligibility & Courier Checker */}
            <div className="bg-surface-container-low p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <span className="font-trade-unit text-trade-unit font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-body-md text-secondary">flight_takeoff</span>
                  Check Shipping & Customs Feasibility:
                </span>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="appearance-none bg-surface-container-lowest pl-space-sm pr-space-lg py-1 rounded text-on-surface font-body-sm text-body-sm font-semibold shadow-sm cursor-pointer focus:outline-none"
                  >
                    <option value="UK">United Kingdom 🇬🇧 (Heathrow / Gatwick)</option>
                    <option value="USA">United States 🇺🇸 (JFK / Houston / Atlanta)</option>
                    <option value="CAN">Canada 🇨🇦 (Toronto Pearson / Montreal)</option>
                    <option value="EU">European Union 🇪🇺 (Frankfurt / Schiphol)</option>
                    <option value="NG">Nigeria 🇳🇬 (Domestic Nationwide Express)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-xs rounded-lg flex items-start gap-space-xs border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-body-md shrink-0 mt-0.5">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  {countryFeasibility[selectedCountry] || countryFeasibility.UK}
                </p>
              </div>
            </div>

            {/* Quantity + Inventory + Cart Actions */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-trade-unit text-trade-unit font-semibold text-on-surface">Quantity:</span>
                  <div className="flex items-center bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-body-sm">remove</span>
                    </button>
                    <span className="w-10 text-center font-trade-unit text-trade-unit font-bold text-on-surface price-num">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-body-sm">add</span>
                    </button>
                  </div>
                </div>

                {/* Lagos Export Hub Status */}
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>In Stock: <strong className="text-on-surface font-semibold">{product.availableQty} units</strong> at Lagos Hub</span>
                </div>
              </div>

              {addedNotice && (
                <div className="p-2.5 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Added {quantity} unit(s) to your produce basket!</span>
                </div>
              )}

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-xs">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.availableQty <= 0}
                  className="sm:col-span-6 py-space-sm px-space-md bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-trade-unit font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-body-md">shopping_cart</span>
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyWithEscrow}
                  className="sm:col-span-4 py-space-sm px-space-md bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary font-trade-unit text-trade-unit font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-body-md">lock</span>
                  <span>Buy with Escrow</span>
                </button>

                <div className="sm:col-span-2 flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product._id)}
                    className={`flex-1 h-full min-h-[44px] bg-surface-container-lowest hover:bg-surface-container-high rounded-xl flex items-center justify-center shadow-sm transition-colors border border-outline-variant/30 ${
                      isFavorited ? 'text-error' : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Save to Wishlist"
                  >
                    <span
                      className="material-symbols-outlined text-headline-md"
                      style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      favorite
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Product link copied to clipboard!');
                    }}
                    className="flex-1 h-full min-h-[44px] bg-surface-container-lowest hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary flex items-center justify-center shadow-sm transition-colors border border-outline-variant/30"
                    title="Share SKU"
                  >
                    <span className="material-symbols-outlined text-headline-md">share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* B2B Commercial Wholesale RFP Accelerator Banner */}
            <div className="bg-surface-container-high p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-headline-md">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-trade-unit text-trade-unit font-bold text-on-surface">
                    Commercial Pallet & Container Loads (100kg+)
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Direct FOB Lagos or CIF destination quotes with air pallet discounting.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/2348000000000?text=${encodeURIComponent(
                  `Hello FarmNexa, I am requesting a bulk wholesale quote for: ${product.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-space-md py-2 bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-primary font-trade-unit text-trade-unit font-bold rounded-lg shadow-sm transition-all whitespace-nowrap text-center"
              >
                Request Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER TABULAR SPECIFICATIONS & EXPORT PROTOCOLS */}
      <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl bg-surface-container-low border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          {/* Tab Header Strip */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-space-md py-space-sm rounded-xl font-trade-unit text-trade-unit font-bold transition-all shadow-sm ${
                activeTab === 'specs'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Technical Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sourcing')}
              className={`px-space-md py-space-sm rounded-xl font-trade-unit text-trade-unit font-bold transition-all shadow-sm ${
                activeTab === 'sourcing'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Processing & Sourcing Provenance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logistics')}
              className={`px-space-md py-space-sm rounded-xl font-trade-unit text-trade-unit font-bold transition-all shadow-sm ${
                activeTab === 'logistics'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              DHL Freight & Customs Protocol
            </button>
          </div>

          {/* Tab Contents */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="flex flex-col gap-2">
                  <h4 className="font-trade-unit font-bold text-primary">Analytical Quality Metrics</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-outline-variant/20 py-2">
                        <td className="py-2 text-on-surface-variant font-semibold">Moisture Target</td>
                        <td className="py-2 text-on-surface font-bold text-right">{product.specifications?.moisture || '< 9.0%'}</td>
                      </tr>
                      <tr className="border-b border-outline-variant/20 py-2">
                        <td className="py-2 text-on-surface-variant font-semibold">Foreign Matter / Sand Content</td>
                        <td className="py-2 text-secondary font-bold text-right">0.00% (Centrifugally Sifted)</td>
                      </tr>
                      <tr className="border-b border-outline-variant/20 py-2">
                        <td className="py-2 text-on-surface-variant font-semibold">Harmonized Tariff (HS Code)</td>
                        <td className="py-2 text-on-surface font-bold text-right">{product.specifications?.hsCode || '0714.10.00'}</td>
                      </tr>
                      <tr className="py-2">
                        <td className="py-2 text-on-surface-variant font-semibold">Packaging Type</td>
                        <td className="py-2 text-on-surface font-bold text-right">{product.specifications?.packaging || 'Multi-barrier Vacuum Pouch'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-trade-unit font-bold text-primary">Border Clearances & Compliance</h4>
                  <ul className="flex flex-col gap-2 text-xs text-on-surface-variant">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                      <span>Nigerian Agricultural Quarantine Service (NAQS) export cleared</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                      <span>Aflatoxin and pesticide residue tested below EU/FDA thresholds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                      <span>Certified authentic geographical provenance from {product.originState}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'sourcing' && (
              <div className="flex flex-col gap-3 text-sm text-on-surface-variant leading-relaxed">
                <h4 className="font-trade-unit font-bold text-primary text-base">Ethical Farmer Union Traceability</h4>
                <p>
                  This produce batch was consolidated directly through the <strong>{product.supplier?.name}</strong>. FarmNexa partners with registered smallholder farmer cooperatives across Nigeria, ensuring guaranteed fair-trade off-take pricing and immediate post-harvest sorting.
                </p>
                <p>
                  Zero chemical fumigants or artificial colourants are introduced during handling or sun curing. Every consignment batch retains verifiable traceability back to the consolidation cluster in {product.originState}.
                </p>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="flex flex-col gap-3 text-sm text-on-surface-variant leading-relaxed">
                <h4 className="font-trade-unit font-bold text-primary text-base">Express Global Cold-Chain & Air Freight</h4>
                <p>
                  International consignments depart via direct scheduled cargo flights from Murtala Muhammed International Airport (LOS) in Lagos to global gateway hubs including London Heathrow (LHR), Leipzig (LEJ), and New York (JFK).
                </p>
                <p>
                  Consignments are packed with industrial desiccant sachets and temperature-monitoring telemetry tags to prevent humidity condensation during high-altitude transit.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RELATED AGRICULTURAL PRODUCE */}
      {related.length > 0 && (
        <section className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl bg-surface">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider">
                Similar Provenance
              </span>
              <h2 className="font-headline-md text-headline-md font-bold text-primary">
                Related Agricultural Produce
              </h2>
            </div>
            <Link to="/products" className="font-trade-unit text-xs text-primary font-bold hover:underline">
              View All Produce →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
            {related.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
