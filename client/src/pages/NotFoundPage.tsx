import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4 shadow-sm">
        <span className="material-symbols-outlined text-4xl">travel_explore</span>
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-secondary font-label-caps mb-1">
        Error 404
      </span>
      <h1 className="font-headline-xl text-3xl md:text-4xl font-extrabold text-primary mb-3">
        Page Not Found
      </h1>
      <p className="font-body-md text-base text-on-surface-variant max-w-md mb-6 leading-relaxed">
        The page you are looking for does not exist or may have been moved. Return to the marketplace to explore authentic Nigerian farm produce.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-6 py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">home</span>
          <span>Back to Home</span>
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-trade-unit text-sm font-semibold rounded-xl transition-colors"
        >
          <span>Browse All Produce</span>
        </Link>
      </div>
    </div>
  );
};
