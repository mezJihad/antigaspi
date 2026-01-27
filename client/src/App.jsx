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
import Terms from './pages/Terms'; // Import Terms

import OfferDetails from './pages/OfferDetails'; // Import

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
            <Route path="/terms" element={<Terms />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/seller-register" element={<SellerRegister />} />
            <Route path="/create-offer" element={<CreateOffer />} />
            <Route path="/edit-offer/:id" element={<EditOffer />} />
            <Route path="/offers/:id" element={<OfferDetails />} /> {/* New Route */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
