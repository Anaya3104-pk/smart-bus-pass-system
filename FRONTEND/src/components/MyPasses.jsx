// src/components/MyPasses.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";

import { 
  FaBus, 
  FaClock, 
  FaCheckCircle, 
  FaTimes, 
  FaCalendarAlt,
  FaQrcode,
  FaDownload,
  FaMoneyBillWave,
  FaArrowLeft,
  FaUser,
  FaRedoAlt,
  FaHistory,
  FaSignOutAlt
} from 'react-icons/fa';

const MyPasses = () => {
  const navigate = useNavigate();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPasses();
  }, [token, navigate]);

  const fetchPasses = async () => {
    try {
      const response = await api.get("/api/passes/my-passes");

      setPasses(response.data);
    } catch (err) {
      console.error('Error fetching passes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock />;
      case 'approved': return <FaCheckCircle />;
      case 'rejected': return <FaTimes />;
      case 'expired': return <FaCalendarAlt />;
      default: return <FaHistory />;
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredPasses = passes.filter(pass => {
    if (filter === 'all') return true;
    if (filter === 'expired') return isExpired(pass.expiry_date);
    return pass.status === filter;
  });

  const generateQRCode = (passNumber) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${passNumber}`;
  };

  const downloadPass = (pass) => {
    alert(`Download feature coming soon! Pass: ${pass.pass_number}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your passes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">My Bus Passes</h1>
                <p className="text-xs text-gray-500">View and manage your passes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-600" />
                  <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                </div>
                <p className="text-xs text-gray-600">Student</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-primary-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Your Bus Passes</h2>
          <p className="text-blue-100">Track and manage all your bus pass applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{passes.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition border border-gray-100">
            <p className="text-2xl font-bold text-yellow-600">{passes.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{passes.filter(p => p.status === 'approved').length}</p>
            <p className="text-xs text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition border border-gray-100">
            <p className="text-2xl font-bold text-red-600">{passes.filter(p => p.status === 'rejected').length}</p>
            <p className="text-xs text-gray-600">Rejected</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition border border-gray-100">
            <p className="text-2xl font-bold text-gray-600">{passes.filter(p => isExpired(p.expiry_date)).length}</p>
            <p className="text-xs text-gray-600">Expired</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'All Passes', value: 'all', icon: <FaBus /> },
              { label: 'Pending', value: 'pending', icon: <FaClock /> },
              { label: 'Approved', value: 'approved', icon: <FaCheckCircle /> },
              { label: 'Rejected', value: 'rejected', icon: <FaTimes /> },
              { label: 'Expired', value: 'expired', icon: <FaCalendarAlt /> }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  filter === btn.value
                    ? 'bg-primary-700 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Passes List */}
        {filteredPasses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBus className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No passes found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't applied for any bus passes yet"
                : `No ${filter} passes`
              }
            </p>
            <button
              onClick={() => navigate('/apply-pass')}
              className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Apply for Pass →
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPasses.map((pass) => (
              <div
                key={pass.pass_id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Pass Info */}
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 flex items-center gap-2 ${getStatusColor(pass.status)}`}>
                          {getStatusIcon(pass.status)} {pass.status.toUpperCase()}
                        </span>
                        {isExpired(pass.expiry_date) && pass.status === 'approved' && (
                          <span className="px-4 py-2 rounded-full font-bold text-sm border-2 bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-2">
                            <FaCalendarAlt /> EXPIRED
                          </span>
                        )}
                      </div>

                      {/* Route Info */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaBus className="text-primary-700" />
                        {pass.route_name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">🚌 Route:</span>
                          {pass.start_point} → {pass.end_point}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">🎫 Pass Number:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{pass.pass_number}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">💰 Fare:</span>
                          <span className="text-xl font-bold text-green-600">₹{pass.fare}</span>
                        </p>
                        {pass.is_renewal && pass.renewal_discount > 0 && (
                          <div className="bg-green-100 border border-green-300 rounded-lg p-2 mt-2">
                            <p className="text-xs text-green-800 font-bold flex items-center gap-1">
                              🎉 Renewal Discount: {pass.renewal_discount}% OFF
                            </p>
                            <p className="text-xs text-green-700">
                              You saved: ₹{(pass.fare * (pass.renewal_discount / 100)).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {pass.issue_date && (
                          <p className="flex items-center gap-2">
                            <span className="font-semibold">📅 Issue Date:</span>
                            {new Date(pass.issue_date).toLocaleDateString('en-IN')}
                          </p>
                        )}
                        {pass.expiry_date && (
                          <p className="flex items-center gap-2">
                            <span className="font-semibold">⏰ Expiry Date:</span>
                            <span className={isExpired(pass.expiry_date) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                              {new Date(pass.expiry_date).toLocaleDateString('en-IN')}
                            </span>
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-xs">
                          <span className="font-semibold">Applied:</span>
                          {new Date(pass.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* QR Code - Only for paid passes */}
                    {pass.status === 'approved' && pass.payment_status === 'success' && !isExpired(pass.expiry_date) && (
                      <div className="lg:w-64 bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-blue-200">
                        <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                          <FaQrcode /> SCAN TO VERIFY
                        </p>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                          <img
                            src={generateQRCode(pass.pass_number)}
                            alt="QR Code"
                            className="w-40 h-40"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">Show this to conductor</p>
                        <button
                          onClick={() => downloadPass(pass)}
                          className="mt-4 bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
                        >
                          <FaDownload />
                          Download Pass
                        </button>
                      </div>
                    )}

                    {/* Pay Now Button - Approved but not paid */}
                    {pass.status === 'approved' && (!pass.payment_status || pass.payment_status === 'pending') && (
                      <div className="lg:w-64 bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-green-200">
                        <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <FaMoneyBillWave className="text-white text-3xl" />
                        </div>
                        <p className="text-center text-sm text-gray-700 font-semibold mb-2">
                          Pass Approved!
                        </p>
                        <p className="text-center text-xs text-gray-600 mb-4">
                          Complete payment to activate
                        </p>
                        <button
                          onClick={() => {
                            console.log('Navigating to payment for pass:', pass.pass_id);
                            navigate(`/payment/${pass.pass_id}`);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
                        >
                          <FaMoneyBillWave />
                          Pay Now
                        </button>
                      </div>
                    )}

                    {/* Cash Payment Pending */}
                    {pass.status === 'approved' && pass.payment_status === 'cash_pending' && (
                      <div className="lg:w-64 bg-yellow-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-yellow-200">
                        <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <FaMoneyBillWave className="text-white text-3xl" />
                        </div>
                        <p className="text-center text-sm text-gray-700 font-semibold mb-2">
                          Cash Payment Pending
                        </p>
                        <p className="text-center text-xs text-gray-600 mb-3">
                          Visit college office to pay
                        </p>
                        <div className="bg-white p-3 rounded-lg mt-2 w-full">
                          <p className="text-xs text-gray-600 text-center">Reference No:</p>
                          <p className="font-mono font-bold text-center">{pass.payment_reference || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Pending Message */}
                    {pass.status === 'pending' && (
                      <div className="lg:w-64 bg-yellow-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-yellow-200">
                        <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <FaClock className="text-white text-3xl" />
                        </div>
                        <p className="text-center text-sm text-gray-700 font-semibold">
                          Your application is under review by admin
                        </p>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          You'll be notified once approved
                        </p>
                      </div>
                    )}

                    {/* Rejected Message */}
                    {pass.status === 'rejected' && (
                      <div className="lg:w-64 bg-red-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-red-200">
                        <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <FaTimes className="text-white text-3xl" />
                        </div>
                        <p className="text-center text-sm text-gray-700 font-semibold mb-4">
                          Application rejected
                        </p>
                        <button
                          onClick={() => navigate('/apply-pass')}
                          className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          Apply Again
                        </button>
                      </div>
                    )}

                    {/* Expired/Renewable Pass */}
                    {(pass.status === 'approved' && isExpired(pass.expiry_date)) && (
                      <div className="lg:w-64 bg-orange-50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-orange-200">
                        <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <FaRedoAlt className="text-white text-3xl" />
                        </div>
                        <p className="text-center text-sm text-gray-700 font-semibold mb-2">
                          Pass Expired
                        </p>
                        <p className="text-xs text-gray-600 mb-4 text-center">
                          Renew to continue using bus service
                        </p>
                        <button
                          onClick={() => navigate('/apply-pass', { 
                            state: { 
                              renewalData: {
                                route_id: pass.route_id,
                                route_name: pass.route_name,
                                start_point: pass.start_point,
                                end_point: pass.end_point,
                                fare: pass.fare,
                                fare_6month: pass.fare_6month,
                                fare_yearly: pass.fare_yearly,
                                distance_km: pass.distance_km,
                                duration: pass.duration
                              }
                            }
                          })}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <FaRedoAlt />
                          Renew Pass
                        </button>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Previous route: {pass.route_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPasses;