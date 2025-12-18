import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import ConductorLogin from './components/ConductorLogin';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ApplyPass from './components/ApplyPass';
import MyPasses from './components/MyPasses';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import AdminCashPayments from './components/AdminCashPayments';
import ConductorTracking from './components/ConductorTracking';
import BusTracking from './components/BusTracking';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Homepage />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/conductor/login" element={<ConductorLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply-pass" element={<ApplyPass />} />
          <Route path="/my-passes" element={<MyPasses />} />
          <Route path="/payment/:passId" element={<PaymentPage />} />
          <Route path="/track-bus" element={<BusTracking />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cash-payments" element={<AdminCashPayments />} />
          
          {/* Conductor Route */}
          <Route path="/conductor/tracking" element={<ConductorTracking />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;