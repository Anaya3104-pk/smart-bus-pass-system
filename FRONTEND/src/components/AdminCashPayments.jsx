// src/components/AdminCashPayments.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";


const AdminCashPayments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cashPayments, setCashPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchCashPayments();
  }, [navigate, token]);

  const fetchCashPayments = async () => {
    try {
      const response = await api.get("/api/admin/payments/cash-pending");

      setCashPayments(response.data);
    } catch (err) {
      console.error('Error fetching cash payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId, studentName) => {
    const confirmed = window.confirm(`Confirm cash payment received from ${studentName}?`);
    if (!confirmed) return;

    setConfirming(paymentId);
    try {
      await api.put(`/api/admin/payments/${paymentId}/confirm-cash`);


      alert('✅ Cash payment confirmed! Pass activated.');
      
      // Remove from list
      setCashPayments(cashPayments.filter(p => p.payment_id !== paymentId));
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setConfirming(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>

      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Cash Payments</h1>
                <p className="text-xs text-gray-500">Confirm cash payments received at office</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                <p className="text-xs text-indigo-600 font-semibold">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-10 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">Cash Payment Confirmation</h2>
              <p className="text-green-100 text-lg">Verify and confirm cash payments from students</p>
            </div>
            <div className="text-6xl">💵</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Cash Payments</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{cashPayments.length}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Amount Pending</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  ₹{cashPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-2xl">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Action Required</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{cashPayments.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-4 rounded-2xl">
                <span className="text-3xl">🔔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Payments List */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Pending Cash Payments</h3>
            <button
              onClick={fetchCashPayments}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading payments...</p>
            </div>
          ) : cashPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 opacity-20">✅</div>
              <p className="text-gray-500 text-xl font-semibold">No pending cash payments</p>
              <p className="text-sm text-gray-400 mt-3">All cash payments have been confirmed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cashPayments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {payment.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800">{payment.full_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">📧 {payment.email}</p>
                          <p className="text-sm text-gray-600">📱 {payment.phone}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Slip Generated: {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="flex-1 bg-green-50 rounded-xl p-5">
                      <p className="text-xs text-gray-600 font-semibold mb-3">PAYMENT DETAILS</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Route:</span>
                          <span className="text-sm font-semibold">{payment.route_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pass Number:</span>
                          <span className="text-sm font-mono font-semibold">{payment.pass_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reference No:</span>
                          <span className="text-sm font-mono font-bold text-green-700">{payment.payment_reference}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-green-200">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-3xl font-bold text-green-600">₹{payment.amount}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col justify-center min-w-[200px]">
                      <button
                        onClick={() => handleConfirmPayment(payment.payment_id, payment.full_name)}
                        disabled={confirming === payment.payment_id}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:transform-none"
                      >
                        {confirming === payment.payment_id ? (
                          'Confirming...'
                        ) : (
                          <>
                            ✓ Confirm Cash
                            <br />
                            <span className="text-sm font-normal">Received</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        This will activate the pass
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCashPayments;