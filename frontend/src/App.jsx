import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & User Pages
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import MedicineDetails from './pages/MedicineDetails';
import SubstituteFinder from './pages/SubstituteFinder';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import InvoiceView from './pages/InvoiceView';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import AboutUs from './pages/AboutUs';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CSVImport from './pages/admin/CSVImport';
import PrescriptionVerification from './pages/admin/PrescriptionVerification';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/medicines" element={<Medicines />} />
                      <Route path="/medicines/:id" element={<MedicineDetails />} />
                      <Route path="/substitutes" element={<SubstituteFinder />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected User Routes */}
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-orders"
                        element={
                          <ProtectedRoute>
                            <MyOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices/:id"
                        element={
                          <ProtectedRoute>
                            <InvoiceView />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Portal Protected Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="medicines" element={<AdminMedicines />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="prescriptions" element={<PrescriptionVerification />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="csv-import" element={<CSVImport />} />
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
