import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-primary text-on-primary pt-12 pb-8 border-t border-primary-container">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-primary-container">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col gap-3 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-display font-extrabold text-xl shadow-sm">
                F
              </div>
              <span className="font-headline-lg text-2xl font-bold tracking-tight text-on-primary">
                FarmNexa
              </span>
            </div>
            <p className="font-body-md text-sm text-on-primary-container leading-relaxed">
              Nigeria’s agricultural marketplace connecting local farming unions, processors, and cooperatives with domestic bulk buyers, retail customers, and international wholesale clients.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="px-3 py-1 rounded-lg bg-primary-container text-primary-fixed text-xs font-bold font-label-caps">
                Direct Farmgate Sourcing
              </div>
              <div className="px-3 py-1 rounded-lg bg-primary-container text-secondary-fixed text-xs font-bold font-label-caps">
                Verified Agricultural Commodities
              </div>
            </div>
          </div>

          {/* Col 2: Curated Produce */}
          <div className="flex flex-col gap-2">
            <h4 className="font-trade-unit text-sm font-bold text-tertiary-fixed tracking-wider uppercase mb-1">
              Produce Categories
            </h4>
            <Link to="/category/cassava-and-garri" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Cassava & Ijebu Garri
            </Link>
            <Link to="/category/grains-and-cereals" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Grains & Ofada Rice
            </Link>
            <Link to="/category/sun-dried-crayfish" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Sun-Dried Oron Crayfish
            </Link>
            <Link to="/category/dried-fish-and-seafood" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Mangrove Smoked Catfish
            </Link>
            <Link to="/category/palm-oil-and-oils" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Nsukka Pure Palm Oil
            </Link>
            <Link to="/category/beans-and-legumes" className="font-body-sm text-sm text-on-primary-container hover:text-on-primary transition-colors py-0.5">
              Honey Beans (Oloyin)
            </Link>
          </div>

          {/* Col 3: Produce Quality */}
          <div className="flex flex-col gap-2">
            <h4 className="font-trade-unit text-sm font-bold text-tertiary-fixed tracking-wider uppercase mb-1">
              Quality Assurance
            </h4>
            <span className="font-body-sm text-sm text-on-primary-container py-0.5">
              Direct Cooperative Sourcing
            </span>
            <span className="font-body-sm text-sm text-on-primary-container py-0.5">
              Moisture-Safe Packaging
            </span>
            <span className="font-body-sm text-sm text-on-primary-container py-0.5">
              Domestic Bulk Supply
            </span>
            <span className="font-body-sm text-sm text-on-primary-container py-0.5">
              Wholesale Commodities
            </span>
            <span className="font-body-sm text-sm text-on-primary-container py-0.5">
              Cleaned & Stone-Free Grains
            </span>
          </div>

          {/* Col 4: Customer Coordination */}
          <div className="flex flex-col gap-2">
            <h4 className="font-trade-unit text-sm font-bold text-tertiary-fixed tracking-wider uppercase mb-1">
              Support & Inquiries
            </h4>
            <p className="font-body-sm text-sm text-on-primary-container leading-relaxed">
              Order and transportation arrangements are coordinated directly with the business owner on WhatsApp.
            </p>
            <a
              href="https://wa.me/2348000000000?text=Hello%20FarmNexa%20Team%2C%20I%20have%20an%20inquiry%20regarding%20agricultural%20produce."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-trade-unit text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-secondary-fixed text-base">chat</span>
              <span>WhatsApp Trade Desk</span>
            </a>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-on-primary-container/80">
              <span className="material-symbols-outlined text-sm text-secondary-fixed">schedule</span>
              <span>Hours: Mon - Sat 8:00 - 18:00 WAT</span>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-primary-container text-xs">
          <p>© {new Date().getFullYear()} FarmNexa Agricultural Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Authentic Nigerian Produce</span>
            <span>•</span>
            <span>Direct Farm Unions</span>
            <span>•</span>
            <span>Secure Marketplace</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
