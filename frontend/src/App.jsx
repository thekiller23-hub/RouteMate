import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import ExploreProducts from './pages/ExploreProducts';
import ProductDetails from './pages/ProductDetails';
import BecomeTraveller from './pages/BecomeTraveller';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Role Dashboards
import RequesterDashboard from './dashboards/requester/RequesterDashboard';
import TravellerDashboard from './dashboards/traveller/TravellerDashboard';
import AdminDashboard from './dashboards/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/explore-products" element={<ExploreProducts />} />
          <Route path="/product-cinema" element={<ProductDetails />} />
          <Route path="/become-traveller" element={<BecomeTraveller />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Requester Dashboard */}
          <Route
            path="/requester/dashboard"
            element={
              <ProtectedRoute allowedRoles={['REQUESTER', 'ADMIN']}>
                <RequesterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Traveller Dashboard */}
          <Route
            path="/traveller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TRAVELLER', 'ADMIN']}>
                <TravellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Administrator Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

