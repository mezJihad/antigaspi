import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SellerRegister from './pages/SellerRegister';
import CreateOffer from './pages/CreateOffer';
import EditOffer from './pages/EditOffer';
import EditShop from './pages/EditShop';
import Terms from './pages/Terms'; // Import Terms
import VerifyEmail from './pages/VerifyEmail'; // Import VerifyEmail
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard

import OfferDetails from './pages/OfferDetails'; // Import

import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} /> {/* New Route */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected Seller Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller-register" element={
              <ProtectedRoute>
                <SellerRegister />
              </ProtectedRoute>
            } />
            <Route path="/create-offer" element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            } />
            <Route path="/edit-offer/:id" element={
              <ProtectedRoute>
                <EditOffer />
              </ProtectedRoute>
            } />
            <Route path="/edit-shop/:id" element={
              <ProtectedRoute>
                <EditShop />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/offers/:id" element={<OfferDetails />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
