import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';

import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';

import { HomePage } from './pages/HomePage.js';
import { CategoryPage } from './pages/CategoryPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AuthCallbackPage } from './pages/AuthCallbackPage.js';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface">
              <Navbar onOpenCart={() => setCartOpen(true)} />

              <main className="flex-1 pt-28">
                <Routes>
                  {/* Public Core Marketplace Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<CategoryPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />

                  {/* Order Confirmation Routes */}
                  <Route path="/order-confirmation/:reference" element={<OrderConfirmationPage />} />
                  <Route path="/order-confirmation/:ref" element={<OrderConfirmationPage />} />
                  <Route path="/order/confirmation/:reference" element={<OrderConfirmationPage />} />

                  {/* Wishlist */}
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* Authentication */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />

                  {/* Customer Account & Dashboard */}
                  <Route path="/dashboard" element={<CustomerDashboardPage />} />
                  <Route path="/account" element={<Navigate to="/dashboard" replace />} />

                  {/* Administrator Portal */}
                  <Route path="/admin" element={<AdminDashboardPage />} />

                  {/* 404 Not Found Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />

              {/* Slide-Out Cart Drawer */}
              <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                onProceedCheckout={() => setCheckoutOpen(true)}
              />

              {/* Checkout Modal */}
              <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
              />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
