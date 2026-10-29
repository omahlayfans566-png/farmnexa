---
name: AgroExport Commerce
colors:
  surface: '#f3fcef'
  surface-dim: '#d4ddd0'
  surface-bright: '#f3fcef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf6e9'
  surface-container: '#e8f0e4'
  surface-container-high: '#e2ebde'
  surface-container-highest: '#dce5d9'
  on-surface: '#161d16'
  on-surface-variant: '#404941'
  inverse-surface: '#2a322a'
  inverse-on-surface: '#eaf3e7'
  outline: '#717970'
  outline-variant: '#c0c9be'
  surface-tint: '#2e6a41'
  primary: '#003b1b'
  on-primary: '#ffffff'
  primary-container: '#14532d'
  on-primary-container: '#87c695'
  inverse-primary: '#96d5a3'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#492c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#674000'
  on-tertiary-container: '#fda417'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f2be'
  primary-fixed-dim: '#96d5a3'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#12512c'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f3fcef'
  on-background: '#161d16'
  surface-variant: '#dce5d9'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  trade-price-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: -0.01em
  trade-price-md:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
  trade-unit:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a high-trust, institutional-grade international trade platform anchored in Nigerian agricultural commerce. It merges high-density consumer discovery (vast catalogs, fast filtering, immediate pricing visibility) with the rigor and security required for cross-border B2B trade. The target audience spans diaspora buyers, institutional commodity importers, and domestic bulk buyers. 

The aesthetic is Modern Agronomic Commerce: structured, clear, and utilitarian, accented with rich organic greens and warm harvest tones that signal soil vitality and provenance. The interface eliminates frivolous decoration in favor of density, razor-sharp tabular data, prominent certifications (NAFDAC, phytosanitary clearance), and immediate export feasibility indicators (MOQ, lead times, international freight options).

## Colors
The palette balances deep agrarian greens with utilitarian neutrals and purposeful warning/accent ambers.

- **Primary (`#14532D`) & Deep Green (`#064E3B`)**: Applied to high-authority anchors including main navigation surfaces, transaction callouts, verified exporter badges, and primary buttons.
- **Fresh Leaf (`#2E8B57`)**: Used selectively for positive trends, stock availability, customs clearance confirmations, and active states.
- **Harvest Amber (`#F59E0B`)**: Reserved for primary calls-to-action requiring rapid visual acquisition, wholesale inquiry tags, flash pricing, and alert triggers.
- **Surface Neutrals**: Base workspace uses Warm Ivory (`#FAF8F1`) and Soft Beige (`#F3EFE3`) to reduce glare during prolonged sourcing sessions, contrasted against subtle light green tints (`#EAF3E8`) for secondary card containers and interactive pills.
- **Typography & Borders**: Dark Charcoal (`#202820`) provides WCAG AAA contrast for body and numerical trade units, supported by Muted Gray (`#6B7280`) for metadata, SKU numbers, and subtle dividers.

## Typography
The system employs a dual-sans pairing: **Manrope** for authoritative structural displays, category banners, and prominent numerical pricing; **Inter** for dense microcopy, administrative layouts, and tabular data.

All agricultural units (kg, metric tons, litres, 50kg bags) and pricing variants must render with `font-feature-settings: "tnum" 1` (tabular figures) to ensure vertical alignment across dense multi-tier pricing sheets and checkout summaries. `trade-price` styles are weighted bold to maximize scan speeds across product grids.

## Layout & Spacing
A fluid 12-column responsive grid engineered for dense e-commerce catalog traversal and enterprise desktop management.

- **Breakpoints**: Mobile (320px–639px, 4 columns, 1rem margins), Tablet (640px–1023px, 8 columns, 1.5rem margins), Desktop (1024px–1440px, 12 columns, 2.5rem margins), Ultra-Wide (>1440px, capped at 1536px centered canvas).
- **Density Philosophy**: Spacing within product listings and administrative sheets conforms to a tight 4px baseline rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px) to maximize viewable SKUs above the fold without sacrificing legibility. Generous vertical spacing (`space-xl` = 32px) is reserved exclusively for major landing section boundaries.

## Elevation & Depth
Depth is rendered through crisp, structural layering rather than heavy ambient blur:

- **Level 0 (Flat Canvas)**: Warm Ivory (`#FAF8F1`) base, un-elevated.
- **Level 1 (Product Cards & Containers)**: Crisp surface cards sit on `#FFFFFF` with a 1px border (`#E5E7EB`) and an ultra-subtle tinted drop shadow: `0 1px 3px rgba(32, 40, 32, 0.05)`.
- **Level 2 (Hover States, Mega-search Flyouts, Currency Drawers)**: `0 8px 24px -4px rgba(6, 78, 59, 0.08)`, paired with a solid `#064E3B` 1px outline token for focused elements.
- **Level 3 (Modals, Wholesale RFP Banners, Logistics Overlays)**: `0 16px 40px -8px rgba(32, 40, 32, 0.16)`, overlaid against an opaque dark charcoal backdrop (`#202820` at 65% opacity).

## Shapes
A conservative, semi-squared shape strategy (`roundedness: 1` = 0.25rem / 4px base). 

Product cards, inputs, buttons, and trade tables utilize 4px border radii to retain an enterprise, logistical character reminiscent of shipping manifests and physical agricultural crates. High-visibility context chips (Origin, Port of Loading, DHL status, MOQ tags) utilize 8px (`rounded-lg`) for tactile separation from structural panels.

## Components

### Header, Search & Global Selectors
- **Global Header**: High-density stacked layout. Top bar hosts currency switcher (NGN/USD/GBP/EUR flags with live conversion indicators), destination port/country selector, and export compliance phone/chat shortcuts.
- **Mega Search**: Unified omni-search input integrated with a primary green search button. Supports dual querying by commodity name (e.g., "Ijebu Garri") or HS Code (e.g., "0714.10"). Includes categorical auto-suggest chips for popular exports.
- **Category Ribbon**: Horizontally scrollable bar featuring agricultural commodities (Tubers, Dried Seafood, Grains & Pulses, Palm & Vegetable Oils, Spices) with clear count badges.

### Product Card (Discovery & B2B Dual-Spec)
- **Visual Container**: Compact card with strict 4:3 image ratio showcasing packaging grade and raw produce.
- **Badges Overlay**: Top-left origin badge (e.g., "Benue State", "Oron, Akwa Ibom"); top-right logistics status (e.g., "Air Cargo Ready", "Sea Freight Only").
- **Commercial Data Block**: Bold price per primary unit (e.g., "$1.40 / kg" or "₦1,800 / kg") paired with a distinct Minimum Order Quantity label ("MOQ: 500 kg").
- **Card Actions**: Dual-button layout—amber button for "Inquire Wholesale" and green outline button for "Add Sample".

### Logistics & Compliance Badges
- **DHL / Cargo Status**: Compact pill badges displaying carrier iconography, lead times (e.g., "DHL Express: 3-5 Days Global"), and temperature control requirements (e.g., "Ambient / Dried").
- **Inspection Badges**: Subtle light green tint (`#EAF3E8`) with `#14532D` typography certifying "Phytosanitary Certified", "NAFDAC Cleared", or "Export Ready".

### Form Controls & Inputs
- **Inputs**: 40px height for dense data entry, bordered in `#D1D5DB`, transitioning to a 2px `#064E3B` ring on focus. Numeric inputs must display fixed currency/unit suffixes (e.g., `USD`, `MT`).
- **Checkboxes & Radios**: Square 16px boxes with `#14532D` solid fills upon selection. Used extensively for freight type filters and packaging tier selection (Jute bags, Vacuum-sealed, Drums).

### Admin Data Tables & Trade Sheets
- **Structure**: Compact, 44px row heights with alternating `#FFFFFF` and `#FAF8F1` striping.
- **Header**: Sticky `#F3EFE3` background, `#202820` bold text, sortable direction arrows.
- **Data Rendering**: Strict right-alignment for numerical quantities and unit prices; left-alignment for commodity identifiers, tracking IDs, and certification status pills.